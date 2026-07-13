package com.abyssreader.api.controller;

import com.abyssreader.api.dto.obra.ObraEditRequestDTO;
import com.abyssreader.api.dto.obra.ObraRequestDTO;
import com.abyssreader.api.dto.obra.ObraResponseDTO;

import com.abyssreader.api.service.ObraInteraccionService;
import com.abyssreader.api.service.ObraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ObraController {

    private final ObraService obraService;
    private final ObraInteraccionService obraInteraccionService;

    @GetMapping("/api/obras")
    public ResponseEntity<List<ObraResponseDTO>> getAllObras() {
        return ResponseEntity.ok(obraService.getAllObras());
    }

    @GetMapping("/api/obras/{id}")
    public ResponseEntity<ObraResponseDTO> getObraById(@PathVariable Long id) {
        ObraResponseDTO response = obraService.getObraById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/obras/recientes")
    public ResponseEntity<org.springframework.data.domain.Page<ObraResponseDTO>> getObrasRecientes(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(obraService.obtenerObrasRecientes(pageable));
    }

    @GetMapping("/api/obra/{nombre}")
    public ResponseEntity<ObraResponseDTO> getObraByNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(obraService.getObraByTitulo(nombre));
    }

    @PostMapping(value = "/api/obras", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MASTER') or (hasRole('MIEMBRO_ADMIN') and @abyssSecurityService.canManageGrupo(authentication, #request.grupoId))")
    public ResponseEntity<ObraResponseDTO> createObra(
            @Valid @RequestPart("datos") ObraRequestDTO request,
            @RequestPart(value = "portada", required = false) MultipartFile portada) {
        return new ResponseEntity<>(obraService.createObra(request, portada), HttpStatus.CREATED);
    }

    @PutMapping(value = "/api/obras/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@abyssSecurityService.canManageObra(authentication, #id)")
    public ResponseEntity<ObraResponseDTO> editObra(
            @PathVariable Long id,
            @RequestPart("datos") ObraEditRequestDTO request,
            @RequestPart(value = "portada", required = false) MultipartFile portada) {
        return ResponseEntity.ok(obraService.editObra(id, request, portada));
    }

    /**
     * POST /api/obras/{id}/like
     * Toggle de like. Zero-Trust: el usuario se extrae del token JWT.
     */
    @PostMapping("/api/obras/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long id) {
        String mail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(obraInteraccionService.toggleLike(id, mail));
    }

    /**
     * GET /api/obras/{id}/like
     * Verifica si el usuario autenticado ya dio like a la obra.
     */
    @GetMapping("/api/obras/{id}/like")
    public ResponseEntity<Map<String, Object>> getLikeStatus(@PathVariable Long id) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.ok(Map.of("liked", false));
        }
        String mail = auth.getName();
        boolean liked = obraInteraccionService.tienelike(id, mail);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    /**
     * DELETE /api/obras/{id}
     * Elimina una obra de forma definitiva con verificación de contraseña.
     * Solo para MASTER.
     */
    @DeleteMapping("/api/obras/{id}")
    @PreAuthorize("hasRole('MASTER')")
    public ResponseEntity<Void> eliminarObra(
            @PathVariable Long id) {
        obraService.eliminarObra(id);
        return ResponseEntity.noContent().build();
    }
}
