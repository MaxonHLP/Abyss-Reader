package com.abyssreader.api.dto.historial;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de salida para una entrada de Historial.
 * Los datos de Obra y Capítulo se aplanan para evitar referencias
 * circulares y minimizar el payload al cliente.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialResponseDTO {

    private Long id;

    // Datos aplanados de la Obra
    private Long obraId;
    private String obraTitulo;
    private String obraPortada;

    // Datos aplanados del Capítulo (último leído)
    private Long capituloId;
    private Double capituloNumero;

    // Fecha de la última actualización (updatedAt de BaseEntity)
    private LocalDateTime updatedAt;
}
