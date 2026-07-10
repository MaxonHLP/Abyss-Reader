package com.abyssreader.api.controller;

import com.abyssreader.api.dto.capitulo.CapituloListItemDTO;
import com.abyssreader.api.dto.capitulo.CapituloResponseDTO;
import com.abyssreader.api.dto.capitulo.ConfirmarCapituloRequestDTO;
import com.abyssreader.api.dto.capitulo.EditarCapituloRequestDTO;
import com.abyssreader.api.dto.capitulo.SignedUrlRequestItem;
import com.abyssreader.api.dto.capitulo.SignedUrlsResponseDTO;
import com.abyssreader.api.service.CapituloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CapituloController {

    private final CapituloService capituloService;

    /**
     * POST /api/obras/{obraId}/capitulos/signed-urls?numero={numero}
     * Fase 1 del flujo de subida directa a GCS.
     * El frontend envía un JSON ligero con los nombres y tipos de las imágenes.
     * El backend devuelve URLs firmadas temporales (15 min) para que el frontend
     * suba los archivos binarios directamente a Google Cloud Storage via PUT.
     * Requiere rol MASTER o MIEMBRO_ADMIN.
     */
    @PostMapping("/api/obras/{obraId}/capitulos/signed-urls")
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN')")
    public ResponseEntity<SignedUrlsResponseDTO> generarUrlsFirmadas(
            @PathVariable Long obraId,
            @RequestParam double numero,
            @RequestParam(required = false, defaultValue = "false") boolean esEdicion,
            @RequestBody @Valid List<SignedUrlRequestItem> archivos
    ) {
        SignedUrlsResponseDTO response = capituloService.generarUrlsFirmadas(obraId, numero, archivos, esEdicion);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/obras/{obraId}/capitulos/confirmar
     * Fase 2 del flujo de subida directa a GCS.
     * El frontend ya subió todas las imágenes a GCS con PUT y ahora envía
     * las URLs públicas finales para que el backend persista el capítulo en la DB.
     * Requiere rol MASTER o MIEMBRO_ADMIN.
     */
    @PostMapping("/api/obras/{obraId}/capitulos/confirmar")
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN')")
    public ResponseEntity<CapituloResponseDTO> confirmarCapitulo(
            @PathVariable Long obraId,
            @RequestBody @Valid ConfirmarCapituloRequestDTO request
    ) {
        CapituloResponseDTO response = capituloService.confirmarCapitulo(obraId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/obras/{nombreObra}/capitulos/{numero}
     * Endpoint público — retorna el CapituloResponseDTO con IDs de navegación.
     * El nombre de la obra puede contener guiones que se convierten a espacios.
     */
    @GetMapping("/api/obras/{nombreObra}/capitulos/{numero}")
    public ResponseEntity<CapituloResponseDTO> obtenerCapitulo(
            @PathVariable String nombreObra,
            @PathVariable double numero
    ) {
        return ResponseEntity.ok(capituloService.obtenerCapituloPorObraYNumero(nombreObra, numero));
    }
    /**
     * GET /api/obras/{obraId}/capitulos
     * Endpoint público — lista todos los capítulos de una obra ordenados por número.
     * Usado por Work.tsx para mostrar la lista sin necesidad de que ObraResponseDTO los incluya.
     */
    @GetMapping("/api/obras/{obraId}/capitulos")
    public ResponseEntity<List<CapituloListItemDTO>> listarCapitulos(
            @PathVariable Long obraId
    ) {
        return ResponseEntity.ok(capituloService.listarCapitulosPorObra(obraId));
    }

    /**
     * PUT /api/capitulos/{id}
     * Actualiza un capítulo existente.
     *
     * <p>El cliente envía un JSON con la lista final y ordenada de URLs públicas de GCS.
     * El frontend se encarga de subir las imágenes nuevas directamente a GCS mediante
     * Signed URLs antes de llamar a este endpoint.
     *
     * Requiere rol MASTER, MIEMBRO_ADMIN o MIEMBRO.
     */
    @PutMapping("/api/capitulos/{id}")
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN', 'MIEMBRO')")
    public ResponseEntity<CapituloResponseDTO> editarCapitulo(
            @PathVariable Long id,
            @RequestBody @Valid EditarCapituloRequestDTO requestDTO
    ) {
        CapituloResponseDTO response = capituloService.editarCapitulo(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/capitulos/{id}
     * Elimina un capítulo definitivamente junto a sus páginas en GCS.
     * Requiere rol MASTER o MIEMBRO_ADMIN.
     */
    @DeleteMapping("/api/capitulos/{id}")
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN')")
    public ResponseEntity<Void> eliminarCapitulo(@PathVariable Long id) {
        capituloService.eliminarCapitulo(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/capitulos/{id}/leido
     * Marca un capítulo como leído para el usuario autenticado (Upsert silencioso).
     */
    @PostMapping("/api/capitulos/{id}/leido")
    public ResponseEntity<Void> marcarComoLeido(@PathVariable Long id) {
        capituloService.marcarComoLeido(id);
        return ResponseEntity.ok().build();
    }
}

