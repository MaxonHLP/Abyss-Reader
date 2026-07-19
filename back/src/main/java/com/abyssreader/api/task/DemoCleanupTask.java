package com.abyssreader.api.task;

import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.abyssreader.api.service.UsuarioService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tarea programada que desactiva (soft-delete) las cuentas demo efímeras vencidas.
 *
 * Se ejecuta cada 24 horas a las 5:20 AM. Para cada cuenta demo expirada:
 * 1. Marca el usuario como activo=false (bloquea el login).
 * 2. Poda los datos pesados de bajo valor: historial, guardados, tracking.
 * 3. CONSERVA: Obras, Comentarios y Grupos para mantener la trazabilidad.
 *
 * IMPORTANTE: Esta clase NO tiene @Transactional intencionalmente.
 * Actúa como orquestador y delega la transacción a UsuarioService por usuario.
 * Así, si un usuario falla, el error no hace rollback de los demás.
 */
@Component
@RequiredArgsConstructor
public class DemoCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(DemoCleanupTask.class);

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    // Se ejecuta cada 3 horas
    // CRON: Segundos Minutos Horas Día_del_mes Mes Día_de_la_semana
    @Scheduled(cron = "0 0 */3 * * ?")
    public void limpiarDemosExpirados() {
        logger.info("Iniciando limpieza diaria de cuentas demo expiradas...");

        try {
            LocalDateTime ahora = LocalDateTime.now();
            List<Usuario> expirados = usuarioRepository.findDemosExpirados(ahora);

            if (expirados.isEmpty()) {
                logger.info("Demo Cleanup: no hay cuentas demo vencidas en este ciclo.");
                return;
            }

            logger.info("Demo Cleanup: se encontraron {} cuentas demo vencidas para desactivar.", expirados.size());
            int desactivados = 0;

            for (Usuario usuario : expirados) {
                try {
                    usuarioService.eliminarUsuarioDemoCompleto(usuario.getId());
                    desactivados++;
                    logger.info("Demo Cleanup: usuario ID {} desactivado exitosamente.", usuario.getId());
                } catch (Exception e) {
                    logger.error("Error al desactivar usuario {}: {}", usuario.getId(), e.getMessage());
                }
            }

            logger.info("Demo Cleanup: {} cuentas demo desactivadas exitosamente.", desactivados);
        } catch (Exception globalError) {
            logger.error("Error general en el proceso de limpieza: {}", globalError.getMessage());
        }

        logger.info("Limpieza diaria finalizada.");
    }
}
