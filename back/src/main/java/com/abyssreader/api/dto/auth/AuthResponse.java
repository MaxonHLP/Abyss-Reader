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
}
