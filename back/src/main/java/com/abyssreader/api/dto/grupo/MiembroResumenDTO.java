package com.abyssreader.api.dto.grupo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroResumenDTO {
    private Long id;
    private String nombre;
    private String rol;
    private String fotoPerfil;
}
