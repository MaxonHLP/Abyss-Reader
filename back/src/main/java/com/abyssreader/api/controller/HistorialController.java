package com.abyssreader.api.controller;

import com.abyssreader.api.dto.historial.HistorialRequestDTO;
import com.abyssreader.api.dto.historial.HistorialResponseDTO;
import com.abyssreader.api.service.HistorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para el Historial de lectura del usuario.
 *
 * ZERO-TRUST: El usuarioId nunca se recibe del cliente. El email del usuario
 * autenticado se extrae del contexto de seguridad de Spring (token JWT validado).
 */
@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialController {

    private final HistorialService historialService;

    /**
     * POST /api/historial/tracking
     * Registra o actualiza (upsert) el progreso de lectura del usuario.
     * Llamado silenciosamente por el ChapterReader al cargar un capítulo.
     */
    @PostMapping("/tracking")
    public ResponseEntity<?> registrarProgreso(
            @Valid @RequestBody HistorialRequestDTO request, org.springframework.validation.BindingResult result) {
        
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        HistorialResponseDTO response = historialService.registrarProgreso(mail, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/historial
     * Lista el historial de lectura del usuario autenticado,
     * ordenado por fecha de última actividad descendente.
     */
    @GetMapping
    public ResponseEntity<List<HistorialResponseDTO>> listarHistorial() {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(historialService.listarHistorial(mail));
    }
}
