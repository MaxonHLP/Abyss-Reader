package com.abyssreader.api.controller;

import com.abyssreader.api.dto.auth.AuthResponse;
import com.abyssreader.api.dto.auth.DemoCreateRequest;
import com.abyssreader.api.dto.auth.LoginRequest;
import com.abyssreader.api.dto.auth.RegisterRequest;
import com.abyssreader.api.exception.DemoCapacityException;
import com.abyssreader.api.exception.DemoRateLimitException;
import com.abyssreader.api.service.AuthService;
import com.abyssreader.api.service.DemoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final DemoService demoService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Crea una cuenta demo efímera o reanuda una sesión demo previa (flujo de reinicio).
     *
     * Flujo:
     * 1. Si viene header X-Demo-Reinit-Token → intenta reutilizar la cuenta existente.
     * 2. Si no → verifica rate limit por IP y cap global, luego crea la cuenta.
     *
     * Respuestas de error:
     * - 429 Too Many Requests: la IP superó el límite de 6 demos por 6 horas.
     * - 503 Service Unavailable: se alcanzaron los 50 demos activos globales.
     */
    @PostMapping("/demo")
    public ResponseEntity<?> crearCuentaDemo(
            @Valid @RequestBody DemoCreateRequest request,
            HttpServletRequest httpRequest,
            @RequestHeader(value = "X-Demo-Reinit-Token", required = false) String reinitToken) {

        String ip = extraerIpCliente(httpRequest);

        try {
            AuthResponse response = demoService.crearOReanudarCuentaDemo(
                    request.getRol(), ip, reinitToken);
            return ResponseEntity.ok(response);

        } catch (DemoRateLimitException e) {
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "RATE_LIMIT"));

        } catch (DemoCapacityException e) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "CAPACITY_LIMIT"));
        }
    }

    /**
     * Extrae la IP real del cliente, considerando el header X-Forwarded-For
     * que establecen proxies inversos como Railway, Cloud Run o Nginx.
     */
    private String extraerIpCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // X-Forwarded-For puede contener múltiples IPs: "clientIP, proxy1, proxy2"
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
