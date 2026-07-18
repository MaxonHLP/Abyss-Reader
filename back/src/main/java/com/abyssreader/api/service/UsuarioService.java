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
     * Desactiva una cuenta demo de forma segura (Soft Delete) y ejecuta un borrado
     * lógico en cascada sobre todo el contenido generado por ese usuario.
     *
     * ORDEN DE EJECUCIÓN (respeta dependencias FK):
     * 1. Poda de datos de consumo: historial, guardados, likes, tracking.
     * 2. Comentarios de capítulo → eliminado=true (bulk update).
     * 3. Comentarios de obra     → eliminado=true (bulk update).
     * 4. Obras                   → activo=false   (bulk update, filtradas por @SQLRestriction).
     * 5. Grupos                  → activo=false   (bulk update, filtrados por @SQLRestriction).
     * 6. Usuario                 → activo=false   (bloquea el login vía DisabledException).
     *
     * @param usuarioId ID del usuario demo a desactivar.
     */
    @Transactional
    public void eliminarUsuarioDemoCompleto(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Demo Cleanup: Usuario con ID " + usuarioId + " no encontrado."));

        if (!Boolean.TRUE.equals(usuario.getEsDemo())) {
            throw new RuntimeException("Demo Cleanup: Seguridad activada. El usuario ID " + usuarioId + " no es Demo. Operación cancelada.");
        }

        // 1. Poda de datos pesados y de bajo valor (no afectan la trazabilidad)
        historialRepository.deleteAllByUsuarioId(usuarioId);
        guardadoRepository.deleteAllByUsuarioId(usuarioId);
        obraLikeRepository.deleteAllByUsuarioId(usuarioId);
        capituloLeidoRepository.deleteAllByUsuarioId(usuarioId);
        vistaTrackingRepository.deleteAllByUsuarioId(usuarioId);

        // 2. Borrado lógico en cascada de comentarios (reutiliza campo 'eliminado')
        //    Se ejecuta ANTES que obras/grupos porque las filas referencian esas entidades.
        comentarioCapituloRepository.desactivarComentariosPorAutor(usuarioId);
        comentarioObraRepository.desactivarComentariosPorAutor(usuarioId);

        // 3. Borrado lógico de obras (activo=false, protege dataCore)
        //    @SQLRestriction en Obra las excluirá de todas las consultas JPA automáticamente.
        obraRepository.desactivarObrasPorCreador(usuarioId);

        // 4. Borrado lógico de grupos (activo=false, protege dataCore)
        //    @SQLRestriction en Grupo los excluirá de todas las consultas JPA automáticamente.
        grupoRepository.desactivarGruposPorCreador(usuarioId);

        // 5. Desactivación lógica del usuario — bloquea el login instantáneamente
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }
}

