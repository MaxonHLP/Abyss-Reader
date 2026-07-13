package com.abyssreader.api.exception;

/**
 * Excepción lanzada cuando un usuario demo intenta modificar/eliminar un recurso
 * que fue creado por otro usuario demo (aislamiento de entorno).
 *
 * El GlobalExceptionHandler la mapea a HTTP 403 con body:
 * { "error": "DEMO_ISOLATION" }
 *
 * El frontend usa este código para mostrar el toast "Acceso Denegado (Aislamiento de Datos)".
 */
public class DemoIsolationException extends RuntimeException {

    public DemoIsolationException() {
        super("Acceso denegado: no puedes modificar recursos creados por otro usuario demo.");
    }
}
