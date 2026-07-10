package com.abyssreader.api.dto.capitulo;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * DTO de la Fase 2: el frontend ya subió las imágenes directamente a GCS
 * y ahora notifica al backend con las URLs públicas finales para persistir el capítulo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmarCapituloRequestDTO {

    @NotNull(message = "El número de capítulo es obligatorio")
    @Positive(message = "El número de capítulo debe ser positivo")
    private Double numero;

    /** Lista de URLs públicas de GCS, en el orden exacto en que deben leerse las páginas. */
    @NotEmpty(message = "La lista de páginas no puede estar vacía")
    private List<String> paginasUrls;
}
