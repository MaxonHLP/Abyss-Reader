package com.abyssreader.api.task;

import com.abyssreader.api.repository.VistaTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class VistaCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(VistaCleanupTask.class);
    private final VistaTrackingRepository vistaTrackingRepository;

    @Scheduled(cron = "0 0 * * * *") // Se ejecuta al minuto 0 de cada hora
    @Transactional
    public void cleanupOldVistas() {
        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        vistaTrackingRepository.deleteOlderThan(hace24Horas);
        logger.info("Recolector de Basura (Vistas): Registros de VistaTracking anteriores a {} han sido eliminados.", hace24Horas);
    }
}
