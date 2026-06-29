package com.abyssreader.api.dto.capitulo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapituloResponseDTO {

    private Long id;
    private double numero;
    private Long obraId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Indica si el usuario actual ha leído este capítulo. */
    private boolean leido;

    /** URLs públicas de cada página del capítulo, en orden. */
    private List<String> paginasUrls;

    /**
     * ID del capítulo anterior de la misma obra (null si es el primero).
     * Calculado en el servicio para evitar N+1 queries.
     */
    private Long capituloAnteriorId;

    /**
     * ID del capítulo siguiente de la misma obra (null si es el último).
     * Calculado en el servicio para evitar N+1 queries.
     */
    private Long capituloSiguienteId;

    /** Número del capítulo anterior (null si no existe). Usado para navegación en el frontend. */
    private Double numeroAnterior;

    /** Número del capítulo siguiente (null si no existe). Usado para navegación en el frontend. */
    private Double numeroSiguiente;
}
