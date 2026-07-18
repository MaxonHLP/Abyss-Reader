package com.abyssreader.api.security;

import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // En nuestro caso, el username es el mail
        Usuario usuario = usuarioRepository.findByMail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + username));

        // Bloquear el acceso si la cuenta fue desactivada (soft-deleted)
        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new DisabledException("La cuenta del usuario '" + username + "' ha sido desactivada.");
        }

        // Mapeamos el Rol de la BD a un GrantedAuthority de Spring Security
        // Convención de Spring Security es usar el prefijo "ROLE_"
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name());

        return new User(
                usuario.getMail(),
                usuario.getContrasena(),
                Collections.singletonList(authority));
    }
}
