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
 * Tarea programada que elimina (soft-delete) las cuentas demo efímeras vencidas.
 *
 * Se ejecuta cada 30 minutos. Para cada cuenta demo expirada:
 * 1. Elimina todos los comentarios creados por este usuario (hard delete).
 * 2. Elimina todos los Capítulos creados por este usuario (hard delete).
 * 3. Elimina todas las Obras creadas por este usuario (hard delete).
 * 4. Elimina todos los Grupos creados por este usuario (hard delete).
 * 5. Si es MIEMBRO, limpia la tabla obra_staff.
 * 6. Marca al usuario como inactivo (soft-delete via @SQLDelete).
 */
@Component
@RequiredArgsConstructor
public class DemoCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(DemoCleanupTask.class);

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Scheduled(fixedDelay = 1800000)
    public void limpiarDemosExpirados() {
        LocalDateTime ahora = LocalDateTime.now();
        List<Usuario> expirados = usuarioRepository.findDemosExpirados(ahora);

        if (expirados.isEmpty()) {
            logger.debug("Demo Cleanup: no hay cuentas demo vencidas en este ciclo.");
            return;
        }

        logger.info("Demo Cleanup: se encontraron {} cuentas demo vencidas para eliminar.", expirados.size());
        int eliminados = 0;

        for (Usuario usuario : expirados) {
            try {
                usuarioService.eliminarUsuarioDemoCompleto(usuario.getId());
                eliminados++;
            } catch (Exception e) {
                logger.error("Demo Cleanup: error al eliminar usuario demo id={}: {}",
                        usuario.getId(), e.getMessage());
            }
        }

        logger.info("Demo Cleanup: {} cuentas demo eliminadas exitosamente.", eliminados);
    }
}
