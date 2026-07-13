package com.abyssreader.api.exception;

/**
 * Excepción lanzada cuando se supera el límite global de 50 cuentas demo activas simultáneas.
 * El controlador la mapea a HTTP 503 (Service Unavailable).
 */
public class DemoCapacityException extends RuntimeException {

    public DemoCapacityException(String message) {
        super(message);
    }
}
