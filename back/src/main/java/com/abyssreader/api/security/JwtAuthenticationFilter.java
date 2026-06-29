package com.abyssreader.api.security;

import com.abyssreader.api.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Obtener el token de la cabecera HTTP
        String token = obtenerJwtDeLaSolicitud(request);

        // 2. Validar el token
        if (StringUtils.hasText(token) && jwtTokenProvider.validarToken(token)) {
            // 3. Obtener el usuario (mail) desde el token
            String username = jwtTokenProvider.obtenerUsernameDeToken(token);

            // 4. Cargar el usuario asociado al token
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

            // 5. Configurar la autenticación en el contexto de Spring Security
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
            );

            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        // 6. Continuar con el resto de la cadena de filtros
        filterChain.doFilter(request, response);
    }

    // Método de utilidad para extraer el token de la cabecera "Authorization"
    private String obtenerJwtDeLaSolicitud(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Quita "Bearer " (los primeros 7 caracteres)
        }
        return null;
    }
}
