package com.abyssreader.api.service;

import com.abyssreader.api.dto.ComentarioRequestDTO;
import com.abyssreader.api.dto.ComentarioResponseDTO;
import com.abyssreader.api.entity.Comentario;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.ComentarioRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ObraRepository obraRepository;
    private final UsuarioRepository usuarioRepository;

    // ─── Lectura ──────────────────────────────────────────────────────────────

    /**
     * Retorna los comentarios raíz de una obra, paginados.
     * Las respuestas anidadas se incluyen recursivamente en el DTO.
     */
    @Transactional(readOnly = true)
    public Page<ComentarioResponseDTO> obtenerComentariosPaginados(Long obraId, Pageable pageable) {
        Page<Comentario> pagina = comentarioRepository
                .findByObraIdAndPadreIsNullOrderByCreatedAtDesc(obraId, pageable);

        List<ComentarioResponseDTO> dtos = pagina.getContent()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, pagina.getTotalElements());
    }

    /**
     * Retorna el total de comentarios activos (no eliminados) de una obra.
     * Se usa para mostrar el contador en el encabezado de la sección.
     */
    @Transactional(readOnly = true)
    public long contarComentariosActivos(Long obraId) {
        return comentarioRepository.countActivosByObraId(obraId);
    }

    // ─── Escritura ────────────────────────────────────────────────────────────

    /**
     * Crea un comentario (raíz o respuesta) para una obra.
     *
     * @param obraId     ID de la obra
     * @param mailAutor  mail del usuario autenticado (extraído del JWT)
     * @param dto        Datos del comentario (contenido + padreId opcional)
     */
    @Transactional
    public ComentarioResponseDTO crearComentario(Long obraId, String mailAutor, ComentarioRequestDTO dto) {
        // Validar contenido
        if (dto.contenido() == null || dto.contenido().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El contenido del comentario no puede estar vacío.");
        }

        // Buscar obra
        Obra obra = obraRepository.findById(obraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada."));

        // Buscar autor
        Usuario autor = usuarioRepository.findByMail(mailAutor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        // Construir entidad
        Comentario comentario = new Comentario();
        comentario.setContenido(dto.contenido().trim());
        comentario.setObra(obra);
        comentario.setAutor(autor);

        // Asignar padre si es respuesta
        if (dto.padreId() != null) {
            Comentario padre = comentarioRepository.findById(dto.padreId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario padre no encontrado."));

            // Verificar que el padre pertenece a la misma obra (seguridad)
            if (!padre.getObra().getId().equals(obraId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comentario padre no pertenece a esta obra.");
            }

            // No permitir responder a comentarios eliminados
            if (padre.isEliminado()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede responder a un comentario eliminado.");
            }

            comentario.setPadre(padre);
        }

        Comentario guardado = comentarioRepository.save(comentario);
        return toDTO(guardado);
    }

    // ─── Eliminación con lógica Soft/Hard Delete ──────────────────────────────

    /**
     * ESTRATEGIA CRÍTICA DE ELIMINACIÓN:
     *
     * Para NO romper el árbol de hilos, la decisión de borrado depende de si
     * el comentario tiene respuestas:
     *
     * - SIN respuestas → Hard delete (se elimina la fila de la BD).
     * - CON respuestas → Soft delete: se limpia el contenido y se marca como
     *   eliminado, pero la fila sobrevive para ser el nodo padre de sus hijos.
     *
     * Solo el AUTOR del comentario o un usuario con rol MASTER pueden eliminar.
     *
     * @param comentarioId ID del comentario a eliminar
     * @param mailUsuario  mail del usuario autenticado que solicita la eliminación
     */
    @Transactional
    public void eliminarComentario(Long comentarioId, String mailUsuario) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado."));

        Usuario usuario = usuarioRepository.findByMail(mailUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        // Verificar autorización: solo el autor o MASTER
        boolean esAutor = comentario.getAutor().getId().equals(usuario.getId());
        boolean esMaster = usuario.getRol() == Rol.MASTER;

        if (!esAutor && !esMaster) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para eliminar este comentario.");
        }

        // Ya eliminado anteriormente por soft-delete: no hacer nada más
        if (comentario.isEliminado()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este comentario ya fue eliminado.");
        }

        boolean tieneRespuestas = !comentario.getRespuestas().isEmpty();

        if (tieneRespuestas) {
            // ── SOFT DELETE ──
            // Preservamos la fila para sostener el árbol de respuestas.
            // Limpiamos el contenido y marcamos como eliminado.
            comentario.setContenido("[Comentario eliminado]");
            comentario.setEliminado(true);
            comentarioRepository.save(comentario);
        } else {
            // ── HARD DELETE ──
            // No hay respuestas que dependan de este nodo → borrado físico seguro.
            comentarioRepository.delete(comentario);
        }
    }

    // ─── Mapeo DTO (recursivo) ────────────────────────────────────────────────

    /**
     * Convierte una entidad Comentario a su DTO de respuesta, incluyendo
     * todas sus respuestas de forma recursiva.
     *
     * No hay riesgo de ciclo infinito porque el DTO solo lleva 'respuestas'
     * (hijos), nunca 'padre' (arriba).
     */
    private ComentarioResponseDTO toDTO(Comentario c) {
        List<ComentarioResponseDTO> respuestasDTO = c.getRespuestas()
                .stream()
                .map(this::toDTO) // recursión
                .collect(Collectors.toList());

        return new ComentarioResponseDTO(
                c.getId(),
                c.getAutor().getNombre(),
                c.getAutor().getFotoPerfil(),
                c.getContenido(),
                c.getCreatedAt(),
                c.isEliminado(),
                respuestasDTO
        );
    }
}
