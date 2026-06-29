package com.abyssreader.api.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta con los datos públicos del perfil del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {
    private Long id;
    private String nombre;
    private String mail;
    private String descripcion;
    private String fotoPerfil;
    private String rol;
}
