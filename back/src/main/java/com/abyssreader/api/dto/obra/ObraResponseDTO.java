package com.abyssreader.api.dto.obra;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObraResponseDTO {

    private Long id;
    private String titulo;
    private String descripcion;
    private String portada;
    private Integer vistas;
    private Integer likes;
    private String estado;
    
    // Aplanando relaciones para evitar ciclos y exponer solo lo necesario
    private String tipoNombre;
    private String demografiaNombre;
    private Long grupoId;
    private String grupoNombre;
    private List<String> generosNombres;
    private List<Long> staffIds;
    private List<String> staffNombres;

}
