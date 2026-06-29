package com.abyssreader.api.controller;

import com.abyssreader.api.dto.obra.ObraResponseDTO;
import com.abyssreader.api.service.ObraService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalogo")
@RequiredArgsConstructor
public class CatalogoController {

    private final ObraService obraService;

    @GetMapping
    public ResponseEntity<Page<ObraResponseDTO>> obtenerCatalogo(
            @RequestParam(required = false) String titulo,
            @RequestParam(name = "tipoId", required = false) java.util.List<Long> tiposIds,
            @RequestParam(name = "demografiaId", required = false) java.util.List<Long> demografiasIds,
            @RequestParam(name = "generoId", required = false) java.util.List<Long> generosIds,
            @RequestParam(name = "estado", required = false) java.util.List<com.abyssreader.api.util.EstadoObra> estados,
            Pageable pageable) {

        Page<ObraResponseDTO> catalogo = obraService.obtenerCatalogoPaginado(titulo, tiposIds, demografiasIds, generosIds, estados, pageable);
        return ResponseEntity.ok(catalogo);
    }
}
