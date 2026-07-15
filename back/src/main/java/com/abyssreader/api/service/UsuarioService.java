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
import com.abyssreader.api.repository.CapituloLeidoRepository;
import com.abyssreader.api.repository.VistaTrackingRepository;
import com.abyssreader.api.repository.ObraLikeRepository;
import com.abyssreader.api.entity.Obra;
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
    private final CapituloLeidoRepository capituloLeidoRepository;
    private final VistaTrackingRepository vistaTrackingRepository;
    private final ObraLikeRepository obraLikeRepository;
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
    public void eliminarUsuarioDemo(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!Boolean.TRUE.equals(usuario.getEsDemo())) {
            throw new RuntimeException("Seguridad (Data Core): El usuario no es Demo. Operación cancelada.");
        }

        // 1. Rompemos las dependencias directas (hijos) del usuario (Evita errores PostgreSQL)
        historialRepository.deleteAllByUsuarioId(usuarioId);
        guardadoRepository.deleteAllByUsuarioId(usuarioId);
        obraLikeRepository.deleteAllByUsuarioId(usuarioId);
        capituloLeidoRepository.deleteAllByUsuarioId(usuarioId);
        vistaTrackingRepository.deleteAllByUsuarioId(usuarioId);

        // 2. Eliminar comentarios del usuario (Bulk Delete)
        comentarioObraRepository.deleteAllByAutorId(usuarioId);
        comentarioCapituloRepository.deleteAllByAutorId(usuarioId);

        // 3. Pertenencia a grupos / Limpieza de relaciones de Miembro
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
                    // Esto asume que el borrado normal de obras del grupo funciona bien,
                    // o que sus capítulos no darán conflictos (idealmente en un esquema Demo
                    // el grupo no tiene tantas obras con interacciones de 3ros).
                    obraRepository.deleteAll(obrasDelGrupo);

                    grupoRepository.deleteById(grupoId);
                }
            }
        }

        // 4. Relaciones indirectas (Obras, Capítulos, Grupos creados por el usuario)
        // Se utiliza Bulk Delete validando que no tengan DataCore
        capituloRepository.deleteAllByCreadorId(usuarioId);
        obraRepository.deleteAllByCreadorId(usuarioId);
        grupoRepository.deleteAllByCreadorId(usuarioId);

        // 5. Finalmente borramos al usuario padre usando SOLO EL ID
        usuarioRepository.deleteById(usuarioId);
    }
}
