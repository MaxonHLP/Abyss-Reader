package com.abyssreader.api.controller;

import com.abyssreader.api.dto.comentario.ComentarioCapituloRequestDTO;
import com.abyssreader.api.dto.comentario.ComentarioCapituloResponseDTO;
import com.abyssreader.api.service.ComentarioCapituloService;
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
 * Controlador REST para el sistema de comentarios de Capítulos.
 *
 * Rutas:
 *   GET    /api/capitulos/{capituloId}/comentarios          → paginado, público
 *   GET    /api/capitulos/{capituloId}/comentarios/count    → contador, público
 *   POST   /api/capitulos/{capituloId}/comentarios          → crear, autenticado
 *   DELETE /api/comentarios/capitulo/{id}                   → eliminar, autenticado (autor o MASTER)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComentarioCapituloController {

    private final ComentarioCapituloService comentarioCapituloService;

    /**
     * GET paginado de comentarios raíz de un capítulo.
     * Público — no requiere autenticación para ver comentarios.
     */
    @GetMapping("/capitulos/{capituloId}/comentarios")
    public ResponseEntity<Page<ComentarioCapituloResponseDTO>> obtenerComentarios(
            @PathVariable Long capituloId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ComentarioCapituloResponseDTO> resultado = comentarioCapituloService.obtenerComentariosPaginados(capituloId, pageable);
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET contador de comentarios activos de un capítulo.
     */
    @GetMapping("/capitulos/{capituloId}/comentarios/count")
    public ResponseEntity<Map<String, Long>> contarComentarios(@PathVariable Long capituloId) {
        long total = comentarioCapituloService.contarComentariosActivos(capituloId);
        return ResponseEntity.ok(Map.of("total", total));
    }

    /**
     * POST para crear un comentario (raíz o respuesta) en un capítulo.
     * Requiere autenticación.
     */
    @PostMapping("/capitulos/{capituloId}/comentarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioCapituloResponseDTO> crearComentario(
            @PathVariable Long capituloId,
            @RequestBody ComentarioCapituloRequestDTO dto,
            Principal principal) {

        ComentarioCapituloResponseDTO creado = comentarioCapituloService.crearComentario(capituloId, principal.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /**
     * DELETE para eliminar un comentario de capítulo.
     * Requiere autenticación. Solo el autor o un MASTER pueden hacerlo.
     */
    @DeleteMapping("/comentarios/capitulo/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarComentario(
            @PathVariable Long id,
            Principal principal) {

        comentarioCapituloService.eliminarComentario(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
