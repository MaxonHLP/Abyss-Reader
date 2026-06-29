package com.abyssreader.api.dto.catalog;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BasicCatalogRequest {
    @NotBlank(message = "El nombre no puede estar en blanco")
    private String nombre;
}
