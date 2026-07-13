package com.abyssreader.api.dto.auth;

import com.abyssreader.api.util.Rol;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String mail;
    private String nombre;
    private Rol rol;
    private Long grupoId;
    private String fotoPerfil;
    /** Token de reinicio para el flujo de sesión demo dual. Null para usuarios normales. */
    private String reinitToken;
    /** Indica si la cuenta es de tipo demo efímero. */
    private Boolean esDemo;
}
