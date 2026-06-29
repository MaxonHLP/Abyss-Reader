package com.abyssreader.api.dto.capitulo;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapituloRequestDTO {

    @NotNull(message = "El número de capítulo es obligatorio")
    @Positive(message = "El número de capítulo debe ser positivo")
    private Double numero;
}
