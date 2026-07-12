package com.abyssreader.api.controller;

import com.abyssreader.api.dto.comentario.ComentarioObraRequestDTO;
import com.abyssreader.api.dto.comentario.ComentarioObraResponseDTO;
import com.abyssreader.api.service.ComentarioObraService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * Controlador REST para el sistema de comentarios de Obras.
 *
 * Rutas:
 *   GET    /api/obras/{obraId}/comentarios          → paginado, público
 *   GET    /api/obras/{obraId}/comentarios/count    → contador, público
 *   POST   /api/obras/{obraId}/comentarios          → crear, autenticado
 *   DELETE /api/comentarios/obra/{id}               → eliminar, autenticado (autor o MASTER)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComentarioObraController {

    private final ComentarioObraService comentarioObraService;

    /**
     * GET paginado de comentarios raíz de una obra.
     * Público — no requiere autenticación para ver comentarios.
     */
    @GetMapping("/obras/{obraId}/comentarios")
    public ResponseEntity<Page<ComentarioObraResponseDTO>> obtenerComentarios(
            @PathVariable Long obraId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ComentarioObraResponseDTO> resultado = comentarioObraService.obtenerComentariosPaginados(obraId, pageable);
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET contador de comentarios activos de una obra.
     */
    @GetMapping("/obras/{obraId}/comentarios/count")
    public ResponseEntity<Map<String, Long>> contarComentarios(@PathVariable Long obraId) {
        long total = comentarioObraService.contarComentariosActivos(obraId);
        return ResponseEntity.ok(Map.of("total", total));
    }

    /**
     * POST para crear un comentario (raíz o respuesta) en una obra.
     * Requiere autenticación.
     */
    @PostMapping("/obras/{obraId}/comentarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioObraResponseDTO> crearComentario(
            @PathVariable Long obraId,
            @RequestBody ComentarioObraRequestDTO dto,
            Principal principal) {

        ComentarioObraResponseDTO creado = comentarioObraService.crearComentario(obraId, principal.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /**
     * DELETE para eliminar un comentario de obra.
     * Requiere autenticación. Solo el autor o un MASTER pueden hacerlo.
     */
    @DeleteMapping("/comentarios/obra/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarComentario(
            @PathVariable Long id,
            Principal principal) {

        comentarioObraService.eliminarComentario(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
