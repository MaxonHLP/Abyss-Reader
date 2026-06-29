package com.abyssreader.api.dto.grupo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiembroResponseDTO {
    private Long id;
    private String nombre;
    private String mail;
    private String rol;
    private String fotoPerfil;
    private Long grupoId;
    private String grupoNombre;
}
