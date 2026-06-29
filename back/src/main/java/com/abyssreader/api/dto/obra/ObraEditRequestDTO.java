package com.abyssreader.api.dto.obra;

import com.abyssreader.api.util.EstadoObra;
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
public class ObraEditRequestDTO {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 255, message = "El título no puede exceder los 255 caracteres")
    private String titulo;

    @Size(max = 1000, message = "La descripción no puede exceder los 1000 caracteres")
    private String descripcion;

    @NotNull(message = "El estado es obligatorio")
    private EstadoObra estado;

    @NotNull(message = "Debe proporcionar al menos un género")
    @Size(min = 1, message = "Debe proporcionar al menos un género")
    private List<Long> generosIds;

    private List<Long> staffIds;
}
