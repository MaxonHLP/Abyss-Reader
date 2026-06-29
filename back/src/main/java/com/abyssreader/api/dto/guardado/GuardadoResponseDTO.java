package com.abyssreader.api.dto.guardado;

import com.abyssreader.api.util.EstadoGuardado;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida para un Guardado.
 * Los datos de Obra se aplanan para evitar referencias circulares
 * y minimizar el payload al cliente.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GuardadoResponseDTO {

    private Long id;
    private EstadoGuardado estado;

    // Datos aplanados de la Obra
    private Long obraId;
    private String obraTitulo;
    private String obraPortada;
}
