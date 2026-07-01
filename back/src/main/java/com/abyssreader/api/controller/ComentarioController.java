package com.abyssreader.api.controller;

import com.abyssreader.api.dto.ComentarioRequestDTO;
import com.abyssreader.api.dto.ComentarioResponseDTO;
import com.abyssreader.api.service.ComentarioService;
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
 * Controlador REST para el sistema de comentarios anidados.
 *
 * Rutas:
 *   GET  /api/obras/{obraId}/comentarios          → paginado, público
 *   GET  /api/obras/{obraId}/comentarios/count    → contador, público
 *   POST /api/obras/{obraId}/comentarios          → crear, autenticado
 *   DELETE /api/comentarios/{id}                  → eliminar, autenticado (autor o MASTER)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    /**
     * GET paginado de comentarios raíz de una obra.
     * Público — no requiere autenticación para ver comentarios.
     *
     * @param obraId ID de la obra
     * @param page   Número de página (default 0)
     * @param size   Elementos por página (default 10)
     */
    @GetMapping("/obras/{obraId}/comentarios")
    public ResponseEntity<Page<ComentarioResponseDTO>> obtenerComentarios(
            @PathVariable Long obraId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ComentarioResponseDTO> resultado = comentarioService.obtenerComentariosPaginados(obraId, pageable);
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET contador de comentarios activos de una obra.
     * Usado para mostrar el número en el encabezado de la sección.
     */
    @GetMapping("/obras/{obraId}/comentarios/count")
    public ResponseEntity<Map<String, Long>> contarComentarios(@PathVariable Long obraId) {
        long total = comentarioService.contarComentariosActivos(obraId);
        return ResponseEntity.ok(Map.of("total", total));
    }

    /**
     * POST para crear un comentario (raíz o respuesta).
     * Requiere autenticación. El padreId en el body es opcional:
     *   - Sin padreId (null) → comentario raíz
     *   - Con padreId        → respuesta al comentario padre
     *
     * El autor se extrae del token JWT via Principal.
     */
    @PostMapping("/obras/{obraId}/comentarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ComentarioResponseDTO> crearComentario(
            @PathVariable Long obraId,
            @RequestBody ComentarioRequestDTO dto,
            Principal principal) {

        ComentarioResponseDTO creado = comentarioService.crearComentario(obraId, principal.getName(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /**
     * DELETE para eliminar un comentario.
     * Requiere autenticación. Solo el autor o un MASTER pueden hacerlo.
     * La lógica de soft vs hard delete se resuelve en el Service.
     */
    @DeleteMapping("/comentarios/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarComentario(
            @PathVariable Long id,
            Principal principal) {

        comentarioService.eliminarComentario(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
