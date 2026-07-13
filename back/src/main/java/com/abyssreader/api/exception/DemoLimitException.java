package com.abyssreader.api.exception;

/**
 * Excepción lanzada cuando un usuario demo supera el límite de creación de entidades.
 *
 * El GlobalExceptionHandler la mapea a HTTP 403 con body:
 * { "error": "DEMO_LIMIT", "entidad": "OBRA"|"GRUPO"|"CAPITULO", "limite": N }
 *
 * El frontend usa el campo "entidad" para mostrar el mensaje correcto en el toast.
 */
public class DemoLimitException extends RuntimeException {

    private final String entidad;
    private final int limite;

    public DemoLimitException(String entidad, int limite) {
        super("Límite demo alcanzado para " + entidad + ": máximo " + limite);
        this.entidad = entidad;
        this.limite = limite;
    }

    public String getEntidad() {
        return entidad;
    }

    public int getLimite() {
        return limite;
    }
}
