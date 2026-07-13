package com.abyssreader.api.exception;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateResource(DuplicateResourceException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Conflicto");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "No Encontrado");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Solicitud inválida");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Acceso denegado");
        response.put("message", "No tenés permisos para realizar esta acción.");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Maneja los intentos de un usuario demo de superar el límite de creación.
     * Retorna HTTP 403 con un body estructurado que el frontend interpreta para mostrar
     * el toast correcto: "Alcanzaste el número máximo de (entidad)".
     */
    @ExceptionHandler(DemoLimitException.class)
    public ResponseEntity<Map<String, Object>> handleDemoLimit(DemoLimitException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "DEMO_LIMIT");
        response.put("entidad", ex.getEntidad());
        response.put("limite", ex.getLimite());
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Maneja los intentos de un usuario demo de modificar recursos de otro usuario demo.
     * Retorna HTTP 403 con código DEMO_ISOLATION para que el frontend muestre
     * el toast "Acceso Denegado (Aislamiento de Datos)".
     */
    @ExceptionHandler(DemoIsolationException.class)
    public ResponseEntity<Map<String, Object>> handleDemoIsolation(DemoIsolationException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "DEMO_ISOLATION");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Error en la operación");
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}

