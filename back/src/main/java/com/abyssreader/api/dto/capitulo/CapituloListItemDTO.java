package com.abyssreader.api.dto.capitulo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO liviano para listar capítulos en la página de una obra.
 * No incluye las URLs de páginas ni los IDs de navegación (eso es del reader).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapituloListItemDTO {
    private Long id;
    private double numero;
    private LocalDateTime createdAt;
    private boolean leido;
}
