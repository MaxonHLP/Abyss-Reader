package com.abyssreader.api.controller;

import com.abyssreader.api.dto.grupo.MiembroRequestDTO;
import com.abyssreader.api.dto.grupo.MiembroResponseDTO;
import com.abyssreader.api.service.MiembroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/miembros")
@RequiredArgsConstructor
public class MiembroController {

    private final MiembroService miembroService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MASTER', 'MIEMBRO_ADMIN')")
    public ResponseEntity<MiembroResponseDTO> createMiembro(@Valid @RequestBody MiembroRequestDTO request) {
        return new ResponseEntity<>(miembroService.createMiembro(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@abyssSecurityService.canDeleteMiembro(authentication, #id)")
    public ResponseEntity<Void> deleteMiembro(@PathVariable Long id) {
        miembroService.deleteMiembro(id);
        return ResponseEntity.noContent().build();
    }
}
