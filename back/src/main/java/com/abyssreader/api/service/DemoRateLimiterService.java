package com.abyssreader.api.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio de rate limiting en memoria usando Bucket4j.
 *
 * Estrategia: cada IP dispone de un Bucket con capacidad de 6 tokens.
 * Los tokens se recargan completamente cada 6 horas (no incrementalmente).
 * Si la IP intenta crear más de 6 cuentas demo en 6 horas, se bloquea.
 *
 * Nota de escalabilidad: Este almacenamiento es local al proceso JVM.
 * Para despliegues multi-nodo, migrar a bucket4j-redis o bucket4j-hazelcast.
 */
@Service
public class DemoRateLimiterService {

    private static final int MAX_DEMOS_POR_IP = 6;
    private static final Duration VENTANA_TIEMPO = Duration.ofHours(6);

    /**
     * Mapa concurrente: IP -> Bucket.
     * ConcurrentHashMap garantiza thread-safety sin bloquear todo el mapa.
     */
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Verifica si la IP puede crear una nueva cuenta demo.
     * Consume un token si está disponible.
     *
     * @param ip La dirección IP del cliente (extraída del request).
     * @return true si se permite la creación, false si el límite fue superado.
     */
    public boolean isAllowed(String ip) {
        Bucket bucket = buckets.computeIfAbsent(ip, this::crearNuevoBucket);
        return bucket.tryConsume(1);
    }

    /**
     * Retorna cuántos tokens le quedan a la IP en su ventana actual.
     * Útil para headers de respuesta informativos (X-RateLimit-Remaining).
     *
     * @param ip La dirección IP del cliente.
     * @return cantidad de tokens disponibles.
     */
    public long getTokensRestantes(String ip) {
        Bucket bucket = buckets.computeIfAbsent(ip, this::crearNuevoBucket);
        return bucket.getAvailableTokens();
    }

    /**
     * Crea un nuevo Bucket para una IP con la política de reposición configurada.
     * Reposición: 6 tokens se restauran de golpe cada 6 horas (recarga greedy).
     */
    private Bucket crearNuevoBucket(String ip) {
        Bandwidth limite = Bandwidth.classic(
                MAX_DEMOS_POR_IP,
                Refill.greedy(MAX_DEMOS_POR_IP, VENTANA_TIEMPO)
        );
        return Bucket.builder()
                .addLimit(limite)
                .build();
    }
}
