package com.abyssreader.api.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Inicializador de datos de arranque.
 *
 * NOTA: Los usuarios demo fijos (Lector@demo.com, MiembroAd@demo.com, Master@demo.com)
 * fueron eliminados. Las cuentas demo ahora se crean dinámicamente via el endpoint
 * POST /api/auth/demo con TTL de 1 hora. Ver DemoService para más detalles.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Reservado para futuros seeds de datos de catálogo (Tipos, Demografías, Géneros).
    }
}

