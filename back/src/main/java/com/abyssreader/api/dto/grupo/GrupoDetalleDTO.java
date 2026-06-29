package com.abyssreader.api.dto.grupo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GrupoDetalleDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String portada;
    private List<ObraResumenDTO> obras;
    private List<MiembroResumenDTO> miembros;
}
