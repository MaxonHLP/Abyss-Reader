package com.abyssreader.api.dto.guardado;

import com.abyssreader.api.util.EstadoGuardado;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de entrada para crear o actualizar un guardado (upsert).
 * SEGURIDAD: No expone ni acepta usuarioId. El usuario se resuelve
 * desde el token JWT via SecurityContextHolder en el Controller.
 */
@Getter
@Setter
@NoArgsConstructor
public class GuardadoRequestDTO {

    @NotNull(message = "El ID de la obra es obligatorio")
    private Long obraId;

    @NotNull(message = "El estado es obligatorio")
    private EstadoGuardado estado;
}
