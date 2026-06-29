package com.abyssreader.api.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO de solicitud para actualizar el perfil del usuario autenticado.
 * Todos los campos son opcionales: solo se actualizan los que vienen con valor.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {

    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombre;

    @Email(message = "El correo debe tener un formato válido")
    @Size(max = 150, message = "El correo no puede exceder los 150 caracteres")
    private String mail;

    @Size(max = 500, message = "La descripción no puede exceder los 500 caracteres")
    private String descripcion;

    /** Nueva contraseña en texto plano (será encriptada en el servicio). */
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String contrasena;

    /** Contraseña actual, requerida para confirmar cambios sensibles (mail o contraseña). */
    private String contrasenaActual;
}
