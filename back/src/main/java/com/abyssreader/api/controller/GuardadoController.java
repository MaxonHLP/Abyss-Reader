package com.abyssreader.api.controller;

import com.abyssreader.api.dto.guardado.GuardadoRequestDTO;
import com.abyssreader.api.dto.guardado.GuardadoResponseDTO;
import com.abyssreader.api.service.GuardadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de la Biblioteca del usuario (Guardados).
 *
 * ZERO-TRUST: El usuarioId nunca se recibe del cliente. El email del usuario
 * autenticado se extrae del contexto de seguridad de Spring (token JWT validado).
 */
@RestController
@RequestMapping("/api/guardados")
@RequiredArgsConstructor
public class GuardadoController {

    private final GuardadoService guardadoService;

    /**
     * POST /api/guardados
     * Crea o actualiza (upsert) el estado de una obra en la biblioteca del usuario.
     */
    @PostMapping
    public ResponseEntity<GuardadoResponseDTO> upsertGuardado(
            @Valid @RequestBody GuardadoRequestDTO request) {

        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        GuardadoResponseDTO response = guardadoService.upsertGuardado(mail, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/guardados
     * Lista todos los guardados de la biblioteca del usuario autenticado.
     */
    @GetMapping
    public ResponseEntity<List<GuardadoResponseDTO>> listarGuardados() {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(guardadoService.listarGuardados(mail));
    }

    /**
     * DELETE /api/guardados/{obraId}
     * Elimina el registro de guardado del usuario para una obra específica.
     */
    @DeleteMapping("/{obraId}")
    public ResponseEntity<Void> eliminarGuardado(@PathVariable Long obraId) {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        guardadoService.eliminarGuardado(mail, obraId);
        return ResponseEntity.noContent().build();
    }
}
