package com.abyssreader.api.service;

import com.abyssreader.api.dto.auth.AuthResponse;
import com.abyssreader.api.dto.auth.LoginRequest;
import com.abyssreader.api.dto.auth.RegisterRequest;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.entity.Miembro;
import com.abyssreader.api.exception.EmailAlreadyExistsException;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.JwtTokenProvider;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validación previa: Verificar si el email ya existe
        if (usuarioRepository.existsByMail(request.getMail())) {
            throw new EmailAlreadyExistsException("El correo electrónico " + request.getMail() + " ya está en uso.");
        }

        // Crear la instancia del nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setMail(request.getMail());

        // Seguridad (Punto Ciego): Encriptar la contraseña con BCrypt
        String contrasenaEncriptada = passwordEncoder.encode(request.getContrasena());
        nuevoUsuario.setContrasena(contrasenaEncriptada);

        // Asignación por defecto: Rol de LECTOR
        nuevoUsuario.setRol(Rol.LECTOR);

        // Guardar el usuario en la base de datos
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // Generar el token para el usuario recién registrado (Opcional, pero común en
        // flujos de registro y auto-login)
        String token = jwtTokenProvider.generarToken(
                usuarioGuardado.getMail(),
                usuarioGuardado.getId(),
                usuarioGuardado.getRol());

        return new AuthResponse(token, usuarioGuardado.getNombre(), usuarioGuardado.getRol(), null, usuarioGuardado.getFotoPerfil());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Búsqueda: Buscar al usuario en la base de datos por su email
        Usuario usuario = usuarioRepository.findByMail(request.getMail())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas")); // Se usa RuntimeException genérica
                                                                                    // para no revelar si el usuario
                                                                                    // existe

        // Verificación: Comprobar si la contraseña coincide con el hash guardado
        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // Generación: Invocar al generador de tokens
        String token = jwtTokenProvider.generarToken(
                usuario.getMail(),
                usuario.getId(),
                usuario.getRol());

        Long grupoId = null;
        if (usuario instanceof Miembro) {
            Miembro miembro = (Miembro) usuario;
            if (miembro.getGrupo() != null) {
                grupoId = miembro.getGrupo().getId();
            }
        }

        return new AuthResponse(token, usuario.getNombre(), usuario.getRol(), grupoId, usuario.getFotoPerfil());
    }
}
