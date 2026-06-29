package com.abyssreader.api.dto.obra;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ObraRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 255, message = "El título no puede exceder los 255 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripción no puede exceder los 1000 caracteres")
    private String descripcion;

    private String portada;

    @NotNull(message = "El tipo_id es obligatorio")
    private Long tipoId;

    @NotNull(message = "El demografia_id es obligatorio")
    private Long demografiaId;

    @NotNull(message = "El grupo_id es obligatorio")
    private Long grupoId;

    @NotNull(message = "Debe proporcionar al menos un género")
    @Size(min = 1, message = "Debe proporcionar al menos un género")
    private List<Long> generosIds;

    private List<Long> staffIds;
}
