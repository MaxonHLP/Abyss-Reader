package com.abyssreader.api.task;

import com.abyssreader.api.entity.Grupo;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import com.abyssreader.api.service.UsuarioService;
import java.util.List;

/**
 * Tarea de migración que se ejecuta al iniciar la aplicación.
 * Busca cualquier usuario o grupo que haya quedado en estado "eliminado" (activo = false)
 * previo a la remoción de la anotación @SQLDelete, y los elimina físicamente (hard delete)
 * junto a todas sus dependencias.
 */
@Component
@RequiredArgsConstructor
public class StartupMigrationTask {

    private static final Logger logger = LoggerFactory.getLogger(StartupMigrationTask.class);

    private final UsuarioRepository usuarioRepository;
    private final EntityManager entityManager;
    private final UsuarioService usuarioService;

    @EventListener(ApplicationReadyEvent.class)
    public void cleanupZombiesOnStartup() {
        try {
            executeMigration();
        } catch (Exception e) {
            logger.error("Error no fatal durante la limpieza de zombies en el arranque: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public void executeMigration() {
        logger.info("Verificando si existen registros soft-deleted (activo = false) para migrarlos a Hard Delete...");

        // 1. Limpiar usuarios soft-deleted
        List<Usuario> usuariosInactivos = usuarioRepository.findByActivoFalse();
        if (!usuariosInactivos.isEmpty()) {
            logger.info("Se encontraron {} usuarios inactivos (soft-deleted). Procediendo a su eliminación física.", usuariosInactivos.size());
            for (Usuario usuario : usuariosInactivos) {
                try {
                    usuarioService.eliminarUsuarioDemo(usuario.getId());
                    logger.info("Usuario demo {} limpiado en inicio", usuario.getMail());
                } catch (Exception e) {
                    logger.warn("StartupMigration: error al limpiar usuario inactivo id={}: {}", usuario.getId(), e.getMessage());
                }
            }
            logger.info("Limpieza de usuarios inactivos finalizada.");
        }

        // 2. Limpiar grupos soft-deleted — se usa native query para bypassear @SQLRestriction
        List<Grupo> gruposInactivos = entityManager
                .createNativeQuery("SELECT * FROM grupos WHERE activo = false", Grupo.class)
                .getResultList();
        if (!gruposInactivos.isEmpty()) {
            logger.info("Se encontraron {} grupos inactivos (soft-deleted). Procediendo a su eliminación física.", gruposInactivos.size());
            try {
                entityManager.createNativeQuery("DELETE FROM grupos WHERE activo = false").executeUpdate();
            } catch (Exception e) {
                logger.warn("StartupMigration: error al limpiar grupos inactivos: {}", e.getMessage());
            }
            logger.info("Limpieza de grupos inactivos finalizada.");
        }
        
        logger.info("Migración de Hard Delete verificada correctamente.");
    }
}
