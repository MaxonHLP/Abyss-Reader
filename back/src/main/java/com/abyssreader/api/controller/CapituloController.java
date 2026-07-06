package com.abyssreader.api.controller;

import com.abyssreader.api.dto.capitulo.CapituloListItemDTO;
import com.abyssreader.api.dto.capitulo.CapituloRequestDTO;
import com.abyssreader.api.dto.capitulo.CapituloResponseDTO;
import com.abyssreader.api.service.CapituloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CapituloController {

    private final CapituloService capituloService;

    /**
     * POST /api/obras/{obraId}/capitulos
     * Crea un nuevo capítulo para una obra, recibiendo metadata y páginas por multipart.
     * Requiere rol MASTER o MIEMBRO_ADMIN.
     */
    @PostMapping(
            value = "/api/obras/{obraId}/capitulos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN')")
    public ResponseEntity<CapituloResponseDTO> crearCapitulo(
            @PathVariable Long obraId,
            @RequestPart("metadata") @Valid CapituloRequestDTO dto,
            @RequestPart("paginas") List<MultipartFile> files
    ) {
        CapituloResponseDTO response = capituloService.crearCapitulo(obraId, dto.getNumero(), files);
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
     * Edita un capítulo existente usando la estrategia de Payload Mixto + Hard Delete.
     *
     * <p>El cliente envía un multipart con:
     * <ul>
     *   <li>{@code ordenFinal} – lista ordenada de URLs existentes o el token "NUEVO".</li>
     *   <li>{@code archivosNuevos} – archivos nuevos (opcional; uno por cada token "NUEVO").</li>
     * </ul>
     *
     * Requiere rol MASTER, MIEMBRO_ADMIN o MIEMBRO.
     */
    @PutMapping(
            value = "/api/capitulos/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN', 'MIEMBRO')")
    public ResponseEntity<CapituloResponseDTO> editarCapitulo(
            @PathVariable Long id,
            @RequestPart("ordenFinal") List<String> ordenFinal,
            @RequestPart(value = "archivosNuevos", required = false) List<MultipartFile> archivosNuevos
    ) {
        CapituloResponseDTO response = capituloService.editarCapitulo(id, ordenFinal, archivosNuevos);
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

