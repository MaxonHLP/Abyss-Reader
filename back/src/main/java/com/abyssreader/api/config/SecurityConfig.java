package com.abyssreader.api.config;

import com.abyssreader.api.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.config.Customizer;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                // 1. Deshabilitamos CSRF porque vamos a usar JWT que es inmune a esto si no se usan cookies
                .csrf(csrf -> csrf.disable())

                // Configuramos el manejo de sesión como STATELESS (sin estado)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configuramos los permisos de las rutas
                .authorizeHttpRequests(authz -> authz
                        // DEJAR PASAR EL PREFLIGHT (OPTIONS) SIEMPRE
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Permitir GET públicos a catálogos, lectura de capítulos, obras y comentarios
                        .requestMatchers(HttpMethod.GET, "/api/tipos", "/api/tipos/**", "/api/demografias", "/api/demografias/**", "/api/generos", "/api/generos/**", "/api/grupos", "/api/grupos/**", "/api/obras", "/api/obras/**", "/api/obra/**", "/api/miembros", "/api/miembros/**", "/api/catalogo", "/api/catalogo/**").permitAll()
                        // GET público de comentarios de capítulos
                        .requestMatchers(HttpMethod.GET, "/api/capitulos/**").permitAll()
                        // Comentarios: DELETE protegido (autor/MASTER)
                        .requestMatchers(HttpMethod.DELETE, "/api/comentarios/**").authenticated()
                        // Permitir todas las peticiones a los endpoints de autenticación, errores y health check
                        .requestMatchers("/api/auth/**", "/error", "/api/health").permitAll()
                        // Perfil del usuario autenticado
                        .requestMatchers("/api/usuarios/me").authenticated()
                        // Edición de capítulos — requiere autenticación (el rol lo verifica @PreAuthorize)
                        .requestMatchers(HttpMethod.PUT, "/api/capitulos/**").authenticated()
                        // Cualquier otra petición deberá estar autenticada
                        .anyRequest().authenticated()
                )

                // Agregamos nuestro filtro JWT antes del filtro de validación de usuario y contraseña de Spring Security
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
