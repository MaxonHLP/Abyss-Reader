package com.abyssreader.api.dto.capitulo;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para actualizar un capítulo existente.
 *
 * <p>El frontend ya subió todas las imágenes nuevas directamente a GCS mediante
 * Signed URLs. Por lo tanto, este DTO recibe únicamente la lista final y ordenada
 * de URLs públicas (las conservadas más las nuevas ya subidas).
 *
 * <p>El campo {@code numero} es opcional: si viene en null, el backend no modifica
 * el número del capítulo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EditarCapituloRequestDTO {

    /**
     * Nuevo número del capítulo. Opcional — si es null, se conserva el actual.
     * Debe ser positivo si se provee.
     */
    @Positive(message = "El número de capítulo debe ser positivo")
    private Double numero;

    /**
     * Lista completa y ordenada de URLs públicas de GCS que formarán el capítulo
     * tras la edición. Incluye tanto las páginas conservadas como las nuevas
     * (que el frontend ya subió directamente a GCS antes de llamar a este endpoint).
     * No puede ser vacía.
     */
    @NotEmpty(message = "La lista de páginas no puede estar vacía")
    private List<String> paginasUrls;
}
