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

/**
 * Servicio para gestión del perfil del usuario autenticado.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
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

        boolean cambioSensible = (request.getMail() != null && !request.getMail().isBlank() && !request.getMail().equals(mail))
                || (request.getContrasena() != null && !request.getContrasena().isBlank());

        // Validación de contraseña actual para cambios sensibles
        if (cambioSensible) {
            if (request.getContrasenaActual() == null || request.getContrasenaActual().isBlank()) {
                throw new RuntimeException("Debés confirmar tu contraseña actual para cambiar el correo o la contraseña.");
            }
            if (!passwordEncoder.matches(request.getContrasenaActual(), usuario.getContrasena())) {
                throw new RuntimeException("La contraseña actual ingresada es incorrecta.");
            }
        }

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
}
