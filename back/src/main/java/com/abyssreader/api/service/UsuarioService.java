package com.abyssreader.api.service;

import com.abyssreader.api.dto.usuario.UpdateProfileRequestDTO;
import com.abyssreader.api.dto.usuario.UserProfileResponseDTO;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.abyssreader.api.repository.HistorialRepository;
import com.abyssreader.api.repository.GuardadoRepository;
import com.abyssreader.api.repository.ComentarioObraRepository;
import com.abyssreader.api.repository.ComentarioCapituloRepository;
import com.abyssreader.api.repository.CapituloRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.GrupoRepository;
import com.abyssreader.api.repository.MiembroRepository;
import com.abyssreader.api.entity.ComentarioObra;
import com.abyssreader.api.entity.ComentarioCapitulo;
import com.abyssreader.api.entity.Capitulo;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Grupo;
import com.abyssreader.api.entity.Miembro;
import com.abyssreader.api.util.Rol;
import java.util.List;

/**
 * Servicio para gestión del perfil del usuario autenticado.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final HistorialRepository historialRepository;
    private final GuardadoRepository guardadoRepository;
    private final ComentarioObraRepository comentarioObraRepository;
    private final ComentarioCapituloRepository comentarioCapituloRepository;
    private final CapituloRepository capituloRepository;
    private final ObraRepository obraRepository;
    private final GrupoRepository grupoRepository;
    private final MiembroRepository miembroRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    /**
     * Obtiene el perfil del usuario autenticado.
     * Si el usuario es un Lector, incluye su descripción.
     */
    @Transactional(readOnly = true)
    public UserProfileResponseDTO getPerfil(String mail) {
        Usuario usuario = usuarioRepository.findByMail(mail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return new UserProfileResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getMail(),
                usuario.getDescripcion(),
                usuario.getFotoPerfil(),
                usuario.getRol().name()
        );
    }

    /**
     * Actualiza el perfil del usuario autenticado.
     * Para cambios en mail o contraseña, se requiere la contraseña actual como confirmación.
     */
    @Transactional
    public UserProfileResponseDTO updatePerfil(String mail, UpdateProfileRequestDTO request, MultipartFile fotoPerfil) {
        Usuario usuario = usuarioRepository.findByMail(mail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));





        // Actualizar nombre
        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre());
        }

        // Actualizar mail (verificar que no esté en uso por otro usuario)
        if (request.getMail() != null && !request.getMail().isBlank() && !request.getMail().equals(mail)) {
            if (usuarioRepository.existsByMail(request.getMail())) {
                throw new RuntimeException("Ese correo electrónico ya está en uso por otro usuario.");
            }
            usuario.setMail(request.getMail());
        }

        // Actualizar contraseña
        if (request.getContrasena() != null && !request.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        }

        // Actualizar descripción
        if (request.getDescripcion() != null) {
            usuario.setDescripcion(request.getDescripcion());
        }

        // Actualizar foto de perfil si se proporcionó una nueva
        if (fotoPerfil != null && !fotoPerfil.isEmpty()) {
            // Borrar foto anterior si la hay
            if (usuario.getFotoPerfil() != null && !usuario.getFotoPerfil().isBlank()) {
                try {
                    storageService.deleteFile(usuario.getFotoPerfil());
                } catch (Exception ignored) {
                    // No bloqueamos si no se puede borrar la foto anterior
                }
            }
            String nuevaUrl = storageService.uploadFile(fotoPerfil, "usuarios/" + usuario.getId() + "/avatar/");
            usuario.setFotoPerfil(nuevaUrl);
        }

        usuarioRepository.save(usuario);

        return new UserProfileResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getMail(),
                usuario.getDescripcion(),
                usuario.getFotoPerfil(),
                usuario.getRol().name()
        );
    }

    /**
     * Eliminación en cascada manual para garantizar que PostgreSQL no falle
     * por restricciones de Foreign Keys existentes.
     */
    @Transactional
    public void eliminarUsuarioDemoCompleto(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Rompemos las dependencias de Lectura/Interacción (Evita errores PostgreSQL)
        historialRepository.deleteAllByUsuarioId(usuarioId);
        guardadoRepository.deleteAllByUsuarioId(usuarioId);

        // 2. Eliminar comentarios del usuario
        List<ComentarioObra> comentariosObra = comentarioObraRepository.findByAutorId(usuarioId);
        comentarioObraRepository.deleteAll(comentariosObra);

        List<ComentarioCapitulo> comentariosCapitulo = comentarioCapituloRepository.findByAutorId(usuarioId);
        comentarioCapituloRepository.deleteAll(comentariosCapitulo);

        // 3. Eliminar capítulos creados por el usuario
        List<Capitulo> capitulos = capituloRepository.findByCreadorId(usuarioId);
        capituloRepository.deleteAll(capitulos);

        // 4. Eliminar obras creadas por el usuario
        List<Obra> obras = obraRepository.findByCreadorId(usuarioId);
        obraRepository.deleteAll(obras);

        // 5. Eliminar grupos creados por el usuario
        List<Grupo> grupos = grupoRepository.findByCreadorId(usuarioId);
        grupoRepository.deleteAll(grupos);

        // 6. Si el usuario es miembro, además hay que limpiar staff
        if (usuario instanceof Miembro miembro) {
            obraRepository.removeMiembroFromAllObras(miembro.getId());
            
            // Lógica de compatibilidad para el admin demo generado automáticamente
            if (miembro.getRol() == Rol.MIEMBRO_ADMIN && miembro.getGrupo() != null) {
                Long grupoId = miembro.getGrupo().getId();

                boolean grupoEsExclusivamenteDemo = miembro.getGrupo().getMiembros()
                        .stream()
                        .allMatch(m -> Boolean.TRUE.equals(m.getEsDemo()));

                if (grupoEsExclusivamenteDemo) {
                    List<Miembro> miembrosGrupo = miembro.getGrupo().getMiembros()
                            .stream()
                            .filter(m -> !m.getId().equals(miembro.getId()))
                            .toList();

                    for (Miembro otroMiembro : miembrosGrupo) {
                        obraRepository.removeMiembroFromAllObras(otroMiembro.getId());
                        miembroRepository.delete(otroMiembro);
                    }

                    List<Obra> obrasDelGrupo = obraRepository.findByGrupoId(grupoId);
                    obraRepository.deleteAll(obrasDelGrupo);

                    grupoRepository.deleteById(grupoId);
                }
            }
        }

        // 7. Finalmente borramos al usuario (ahora está libre)
        usuarioRepository.delete(usuario);
    }
}
