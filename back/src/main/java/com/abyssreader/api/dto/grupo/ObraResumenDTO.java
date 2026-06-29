package com.abyssreader.api.dto.grupo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObraResumenDTO {
    private Long id;
    private String titulo;
    private String portada;
    private Integer vistas;
    private Integer likes;
}
