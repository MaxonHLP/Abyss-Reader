package com.abyssreader.api.controller;

import com.abyssreader.api.dto.usuario.UpdateProfileRequestDTO;
import com.abyssreader.api.dto.usuario.UserProfileResponseDTO;
import com.abyssreader.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controlador REST para el perfil del usuario autenticado.
 * Zero-Trust: el mail del usuario se extrae del token JWT, nunca del cliente.
 */
@RestController
@RequestMapping("/api/usuarios/me")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * GET /api/usuarios/me
     * Retorna el perfil completo del usuario autenticado (incluye descripción si es Lector).
     */
    @GetMapping
    public ResponseEntity<UserProfileResponseDTO> getPerfil() {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(usuarioService.getPerfil(mail));
    }

    /**
     * PUT /api/usuarios/me
     * Actualiza el perfil del usuario autenticado.
     * Recibe datos como multipart/form-data (datos JSON + foto de perfil opcional).
     */
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponseDTO> updatePerfil(
            @RequestPart("datos") UpdateProfileRequestDTO request,
            @RequestPart(value = "fotoPerfil", required = false) MultipartFile fotoPerfil) {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(usuarioService.updatePerfil(mail, request, fotoPerfil));
    }
}
