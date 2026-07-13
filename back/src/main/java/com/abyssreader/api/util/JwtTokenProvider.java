package com.abyssreader.api.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    /** Expiración para tokens de cuentas demo: 1 hora (3600000 ms). */
    @Value("${jwt.demo.expiration:3600000}")
    private long jwtDemoExpirationInMs;

    /**
     * Genera un token JWT estándar con la expiración configurada en application.properties.
     * Usado para login y registro de usuarios normales.
     */
    public String generarToken(String mail, Long id, Rol rol) {
        return generarTokenConExpiracion(mail, id, rol, jwtExpirationInMs);
    }

    /**
     * Genera un token JWT para cuentas demo con expiración de 1 hora.
     * Incluye el claim "demo=true" para distinguirlo del token estándar.
     */
    public String generarTokenDemo(String mail, Long id, Rol rol) {
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + jwtDemoExpirationInMs);

        return Jwts.builder()
                .setSubject(mail)
                .claim("id", id)
                .claim("rol", rol.name())
                .claim("demo", true)
                .setIssuedAt(ahora)
                .setExpiration(fechaExpiracion)
                .signWith(obtenerClaveFirma(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Genera un token JWT con expiración personalizada.
     * Método base utilizado por generarToken y generarTokenDemo.
     */
    public String generarTokenConExpiracion(String mail, Long id, Rol rol, long expirationMs) {
        Date ahora = new Date();
        Date fechaExpiracion = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(mail)
                .claim("id", id)
                .claim("rol", rol.name())
                .setIssuedAt(ahora)
                .setExpiration(fechaExpiracion)
                .signWith(obtenerClaveFirma(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String obtenerUsernameDeToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(obtenerClaveFirma())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validarToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(obtenerClaveFirma())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            // Aquí se podrían capturar Excepciones específicas como ExpiredJwtException,
            // UnsupportedJwtException, MalformedJwtException, SignatureException, etc.
            // Para mantenerlo limpio en un primer paso, retornamos false si algo falla.
            return false;
        }
    }

    private Key obtenerClaveFirma() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
