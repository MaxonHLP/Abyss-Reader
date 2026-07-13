package com.abyssreader.api.task;

import com.abyssreader.api.entity.Capitulo;
import com.abyssreader.api.entity.ComentarioCapitulo;
import com.abyssreader.api.entity.ComentarioObra;
import com.abyssreader.api.entity.Grupo;
import com.abyssreader.api.entity.Miembro;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.CapituloRepository;
import com.abyssreader.api.repository.ComentarioCapituloRepository;
import com.abyssreader.api.repository.ComentarioObraRepository;
import com.abyssreader.api.repository.GrupoRepository;
import com.abyssreader.api.repository.MiembroRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final MiembroRepository miembroRepository;
    private final ObraRepository obraRepository;
    private final GrupoRepository grupoRepository;
    private final CapituloRepository capituloRepository;
    private final ComentarioObraRepository comentarioObraRepository;
    private final ComentarioCapituloRepository comentarioCapituloRepository;

    @Scheduled(fixedDelay = 1800000)
    @Transactional
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
                eliminarUsuarioDemo(usuario);
                eliminados++;
            } catch (Exception e) {
                logger.error("Demo Cleanup: error al eliminar usuario demo id={}: {}",
                        usuario.getId(), e.getMessage());
            }
        }

        logger.info("Demo Cleanup: {} cuentas demo eliminadas exitosamente.", eliminados);
    }

    private void eliminarUsuarioDemo(Usuario usuario) {
        Long usuarioId = usuario.getId();

        // 1. Eliminar comentarios del usuario (Hard Delete)
        List<ComentarioObra> comentariosObra = comentarioObraRepository.findByAutorId(usuarioId);
        comentarioObraRepository.deleteAll(comentariosObra);
        logger.info("Demo Cleanup: {} comentarios de obra eliminados.", comentariosObra.size());

        List<ComentarioCapitulo> comentariosCapitulo = comentarioCapituloRepository.findByAutorId(usuarioId);
        comentarioCapituloRepository.deleteAll(comentariosCapitulo);
        logger.info("Demo Cleanup: {} comentarios de capítulo eliminados.", comentariosCapitulo.size());

        // 2. Eliminar capítulos creados por el usuario (Hard Delete)
        List<Capitulo> capitulos = capituloRepository.findByCreadorId(usuarioId);
        capituloRepository.deleteAll(capitulos);
        logger.info("Demo Cleanup: {} capítulos eliminados.", capitulos.size());

        // 3. Eliminar obras creadas por el usuario (Hard Delete)
        List<Obra> obras = obraRepository.findByCreadorId(usuarioId);
        obraRepository.deleteAll(obras);
        logger.info("Demo Cleanup: {} obras eliminadas.", obras.size());

        // 4. Eliminar grupos creados por el usuario (Hard Delete / Soft Delete via JPA)
        List<Grupo> grupos = grupoRepository.findByCreadorId(usuarioId);
        grupoRepository.deleteAll(grupos);
        logger.info("Demo Cleanup: {} grupos eliminados.", grupos.size());

        // Si el usuario es miembro, además hay que limpiar staff
        if (usuario instanceof Miembro miembro) {
            obraRepository.removeMiembroFromAllObras(miembro.getId());
            
            // Lógica original de compatibilidad para el admin demo generado automáticamente
            if (miembro.getRol() == Rol.MIEMBRO_ADMIN && miembro.getGrupo() != null) {
                Long grupoId = miembro.getGrupo().getId();

                boolean grupoEsExclusivamenteDemo = miembro.getGrupo().getMiembros()
                        .stream()
                        .allMatch(m -> Boolean.TRUE.equals(m.getEsDemo()));

                if (grupoEsExclusivamenteDemo) {
                    List<Miembro> miembrosGrupo = miembro.getGrupo().getMiembros()
                            .stream()
                            .filter(m -> !m.getId().equals(miembro.getId()))
                            .toList();

                    for (Miembro otroMiembro : miembrosGrupo) {
                        obraRepository.removeMiembroFromAllObras(otroMiembro.getId());
                        miembroRepository.delete(otroMiembro);
                        logger.info("Demo Cleanup: miembro extra {} eliminado.", otroMiembro.getNombre());
                    }

                    List<Obra> obrasDelGrupo = obraRepository.findByGrupoId(grupoId);
                    obraRepository.deleteAll(obrasDelGrupo);

                    grupoRepository.deleteById(grupoId);
                    logger.info("Demo Cleanup: grupo automático id={} eliminado.", grupoId);
                }
            }
        }

        // Soft-delete del usuario
        usuarioRepository.delete(usuario);
        logger.info("Demo Cleanup: usuario demo '{}' ({}) marcado como inactivo.",
                usuario.getNombre(), usuario.getRol());
    }
}
