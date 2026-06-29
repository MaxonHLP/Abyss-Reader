package com.abyssreader.api.controller;

import com.abyssreader.api.dto.catalog.BasicCatalogRequest;
import com.abyssreader.api.dto.catalog.BasicCatalogResponse;
import com.abyssreader.api.service.DemografiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demografias")
@RequiredArgsConstructor
public class DemografiaController {

    private final DemografiaService demografiaService;

    @GetMapping
    public ResponseEntity<List<BasicCatalogResponse>> getAllDemografias() {
        return ResponseEntity.ok(demografiaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BasicCatalogResponse> getDemografiaById(@PathVariable Long id) {
        return ResponseEntity.ok(demografiaService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<BasicCatalogResponse> createDemografia(@Valid @RequestBody BasicCatalogRequest request) {
        return new ResponseEntity<>(demografiaService.save(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<BasicCatalogResponse> updateDemografia(@PathVariable Long id, @Valid @RequestBody BasicCatalogRequest request) {
        return ResponseEntity.ok(demografiaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<Void> deleteDemografia(@PathVariable Long id) {
        demografiaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
