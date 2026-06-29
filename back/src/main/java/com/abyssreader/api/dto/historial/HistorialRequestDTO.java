package com.abyssreader.api.dto.historial;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de entrada para registrar o actualizar el progreso de lectura (upsert).
 * SEGURIDAD: No expone ni acepta usuarioId. El usuario se resuelve
 * desde el token JWT via SecurityContextHolder en el Controller.
 */
@Getter
@Setter
@NoArgsConstructor
public class HistorialRequestDTO {

    @NotNull(message = "El ID de la obra es obligatorio")
    private Long obraId;

    @NotNull(message = "El ID del capítulo es obligatorio")
    private Long capituloId;
}
