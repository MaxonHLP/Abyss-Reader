package com.abyssreader.api.dto.catalog;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BasicCatalogResponse {
    private Long id;
    private String nombre;
}
