package com.abyssreader.api.service;

import com.abyssreader.api.dto.comentario.ComentarioObraRequestDTO;
import com.abyssreader.api.dto.comentario.ComentarioObraResponseDTO;
import com.abyssreader.api.entity.ComentarioObra;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.ComentarioObraRepository;
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
public class ComentarioObraService {

    private final ComentarioObraRepository comentarioObraRepository;
    private final ObraRepository obraRepository;
    private final UsuarioRepository usuarioRepository;

    // ─── Lectura ──────────────────────────────────────────────────────────────

    /**
     * Retorna los comentarios raíz de una obra, paginados.
     * Las respuestas anidadas se incluyen recursivamente en el DTO.
     */
    @Transactional(readOnly = true)
    public Page<ComentarioObraResponseDTO> obtenerComentariosPaginados(Long obraId, Pageable pageable) {
        Page<ComentarioObra> pagina = comentarioObraRepository
                .findByObraIdAndPadreIsNullOrderByCreatedAtDesc(obraId, pageable);

        List<ComentarioObraResponseDTO> dtos = pagina.getContent()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, pagina.getTotalElements());
    }

    /**
     * Retorna el total de comentarios activos (no eliminados) de una obra.
     */
    @Transactional(readOnly = true)
    public long contarComentariosActivos(Long obraId) {
        return comentarioObraRepository.countActivosByObraId(obraId);
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
    public ComentarioObraResponseDTO crearComentario(Long obraId, String mailAutor, ComentarioObraRequestDTO dto) {
        if (dto.contenido() == null || dto.contenido().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El contenido del comentario no puede estar vacío.");
        }

        Obra obra = obraRepository.findById(obraId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Obra no encontrada."));

        Usuario autor = usuarioRepository.findByMail(mailAutor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        ComentarioObra comentario = new ComentarioObra();
        comentario.setContenido(dto.contenido().trim());
        comentario.setObra(obra);
        comentario.setAutor(autor);

        if (dto.padreId() != null) {
            ComentarioObra padre = comentarioObraRepository.findById(dto.padreId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario padre no encontrado."));

            if (!padre.getObra().getId().equals(obraId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comentario padre no pertenece a esta obra.");
            }

            if (padre.isEliminado()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede responder a un comentario eliminado.");
            }

            comentario.setPadre(padre);
        }

        ComentarioObra guardado = comentarioObraRepository.save(comentario);
        return toDTO(guardado);
    }

    // ─── Eliminación con lógica Soft/Hard Delete ──────────────────────────────

    /**
     * ESTRATEGIA DE ELIMINACIÓN:
     * - SIN respuestas → Hard delete.
     * - CON respuestas → Soft delete: limpia el contenido y marca como eliminado.
     *
     * Solo el AUTOR del comentario o un usuario con rol MASTER pueden eliminar.
     */
    @Transactional
    public void eliminarComentario(Long comentarioId, String mailUsuario) {
        ComentarioObra comentario = comentarioObraRepository.findById(comentarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado."));

        Usuario usuario = usuarioRepository.findByMail(mailUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        boolean esAutor = comentario.getAutor().getId().equals(usuario.getId());
        boolean esMaster = usuario.getRol() == Rol.MASTER;

        if (!esAutor && !esMaster) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso para eliminar este comentario.");
        }

        if (comentario.isEliminado()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este comentario ya fue eliminado.");
        }

        boolean tieneRespuestas = !comentario.getRespuestas().isEmpty();

        if (tieneRespuestas) {
            comentario.setContenido("[Comentario eliminado]");
            comentario.setEliminado(true);
            comentarioObraRepository.save(comentario);
        } else {
            ComentarioObra padre = comentario.getPadre();
            comentarioObraRepository.delete(comentario);

            while (padre != null) {
                padre.getRespuestas().remove(comentario);
                if (padre.isEliminado() && padre.getRespuestas().isEmpty()) {
                    comentario = padre;
                    padre = padre.getPadre();
                    comentarioObraRepository.delete(comentario);
                } else {
                    break;
                }
            }
        }
    }

    // ─── Mapeo DTO (recursivo) ────────────────────────────────────────────────

    private ComentarioObraResponseDTO toDTO(ComentarioObra c) {
        List<ComentarioObraResponseDTO> respuestasDTO = c.getRespuestas()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new ComentarioObraResponseDTO(
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
