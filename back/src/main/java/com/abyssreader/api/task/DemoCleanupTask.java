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
 * Tarea programada que elimina (hard-delete) las cuentas demo efímeras vencidas.
 *
 * Se ejecuta cada 24 horas a las 5:20 AM. Para cada cuenta demo expirada:
 * 1. Elimina todos los historiales y guardados.
 * 2. Elimina todos los comentarios creados por este usuario (hard delete).
 * 3. Elimina todos los Capítulos creados por este usuario (hard delete).
 * 4. Elimina todas las Obras creadas por este usuario (hard delete).
 * 5. Elimina todos los Grupos creados por este usuario (hard delete).
 * 6. Si es MIEMBRO, limpia la tabla obra_staff.
 * 7. Elimina físicamente al usuario.
 */
@Component
@RequiredArgsConstructor
public class DemoCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(DemoCleanupTask.class);

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    // Se ejecuta todos los días a las 5:20 AM
    // CRON: Segundos Minutos Horas Día_del_mes Mes Día_de_la_semana
    @Scheduled(cron = "0 20 5 * * ?")
    public void limpiarDemosExpirados() {
        logger.info("Iniciando limpieza diaria de cuentas demo expiradas...");
        
        try {
            LocalDateTime ahora = LocalDateTime.now();
            List<Usuario> expirados = usuarioRepository.findDemosExpirados(ahora);

            if (expirados.isEmpty()) {
                logger.info("Demo Cleanup: no hay cuentas demo vencidas en este ciclo.");
                return;
            }

            logger.info("Demo Cleanup: se encontraron {} cuentas demo vencidas para eliminar.", expirados.size());
            int eliminados = 0;

            for (Usuario usuario : expirados) {
                try {
                    usuarioService.eliminarUsuarioDemo(usuario.getId());
                    eliminados++;
                } catch (Exception e) {
                    logger.error("Error al borrar usuario {}: {}", usuario.getId(), e.getMessage());
                }
            }

            logger.info("Demo Cleanup: {} cuentas demo eliminadas exitosamente.", eliminados);
        } catch (Exception globalError) {
            logger.error("Error general en el proceso de limpieza: {}", globalError.getMessage());
        }
        
        logger.info("Limpieza diaria finalizada.");
    }
}
