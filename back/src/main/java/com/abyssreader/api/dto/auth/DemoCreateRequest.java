package com.abyssreader.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO para la creación de cuentas demo efímeras.
 * El rol debe ser uno de los tres valores permitidos: LECTOR, MASTER, MIEMBRO_ADMIN.
 */
@Getter
@Setter
public class DemoCreateRequest {

    @NotBlank(message = "El rol no puede estar vacío")
    @Pattern(
        regexp = "^(LECTOR|MASTER|MIEMBRO_ADMIN)$",
        message = "Rol inválido. Valores permitidos: LECTOR, MASTER, MIEMBRO_ADMIN"
    )
    private String rol;
}
