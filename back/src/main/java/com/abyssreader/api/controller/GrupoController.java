package com.abyssreader.api.controller;

import com.abyssreader.api.dto.grupo.GrupoRequestDTO;
import com.abyssreader.api.dto.grupo.GrupoResponseDTO;
import com.abyssreader.api.dto.grupo.GrupoDetalleDTO;
import com.abyssreader.api.dto.auth.PasswordConfirmationDTO;
import com.abyssreader.api.service.GrupoService;
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
@RequestMapping("/api/grupos")
@RequiredArgsConstructor
public class GrupoController {

    private final GrupoService grupoService;

    @GetMapping
    public ResponseEntity<List<GrupoResponseDTO>> getAllGrupos() {
        return ResponseEntity.ok(grupoService.getAllGrupos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrupoDetalleDTO> getGrupoById(@PathVariable Long id) {
        return ResponseEntity.ok(grupoService.getGrupoById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<GrupoResponseDTO> createGrupo(
            @Valid @RequestPart("datos") GrupoRequestDTO request,
            @RequestPart(value = "portada", required = false) MultipartFile portada) {
        return new ResponseEntity<>(grupoService.createGrupo(request, portada), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/obras")
    @PreAuthorize("@abyssSecurityService.canManageGrupo(authentication, #id)")
    public ResponseEntity<Void> addObraToGrupo(@PathVariable Long id, @RequestBody Long obraId) {
        // Lógica para añadir obra delegada al servicio
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{id}/miembros")
    @PreAuthorize("@abyssSecurityService.canManageGrupo(authentication, #id)")
    public ResponseEntity<Void> addMiembroToGrupo(@PathVariable Long id, @RequestBody Long miembroId) {
        // Lógica para añadir miembro delegada al servicio
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@abyssSecurityService.canManageGrupo(authentication, #id)")
    public ResponseEntity<GrupoResponseDTO> updateGrupo(
            @PathVariable Long id,
            @Valid @RequestPart("datos") GrupoRequestDTO request,
            @RequestPart(value = "portada", required = false) MultipartFile portada) {
        return ResponseEntity.ok(grupoService.updateGrupo(id, request, portada));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<Void> deleteGrupo(@PathVariable Long id, @Valid @RequestBody PasswordConfirmationDTO request) {
        grupoService.deleteGrupo(id, request.getPassword());
        return ResponseEntity.noContent().build();
    }
}
