package com.abyssreader.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordConfirmationDTO {
    @NotBlank(message = "La contraseña no puede estar vacía")
    private String password;
}
