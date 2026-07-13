package com.abyssreader.api.exception;

/**
 * Excepción lanzada cuando una IP supera el límite de creación de cuentas demo.
 * El controlador la mapea a HTTP 429 (Too Many Requests).
 */
public class DemoRateLimitException extends RuntimeException {

    public DemoRateLimitException(String message) {
        super(message);
    }
}
