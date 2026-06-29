package com.abyssreader.api.controller;

import com.abyssreader.api.dto.catalog.BasicCatalogRequest;
import com.abyssreader.api.dto.catalog.BasicCatalogResponse;
import com.abyssreader.api.service.TipoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos")
@RequiredArgsConstructor
public class TipoController {

    private final TipoService tipoService;

    @GetMapping
    public ResponseEntity<List<BasicCatalogResponse>> getAllTipos() {
        return ResponseEntity.ok(tipoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BasicCatalogResponse> getTipoById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<BasicCatalogResponse> createTipo(@Valid @RequestBody BasicCatalogRequest request) {
        return new ResponseEntity<>(tipoService.save(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<BasicCatalogResponse> updateTipo(@PathVariable Long id, @Valid @RequestBody BasicCatalogRequest request) {
        return ResponseEntity.ok(tipoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<Void> deleteTipo(@PathVariable Long id) {
        tipoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
