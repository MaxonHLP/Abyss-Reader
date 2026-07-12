package com.abyssreader.api.service;

import com.abyssreader.api.dto.comentario.ComentarioCapituloRequestDTO;
import com.abyssreader.api.dto.comentario.ComentarioCapituloResponseDTO;
import com.abyssreader.api.entity.Capitulo;
import com.abyssreader.api.entity.ComentarioCapitulo;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.CapituloRepository;
import com.abyssreader.api.repository.ComentarioCapituloRepository;
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
public class ComentarioCapituloService {

    private final ComentarioCapituloRepository comentarioCapituloRepository;
    private final CapituloRepository capituloRepository;
    private final UsuarioRepository usuarioRepository;

    // ─── Lectura ──────────────────────────────────────────────────────────────

    /**
     * Retorna los comentarios raíz de un capítulo, paginados.
     * Las respuestas anidadas se incluyen recursivamente en el DTO.
     */
    @Transactional(readOnly = true)
    public Page<ComentarioCapituloResponseDTO> obtenerComentariosPaginados(Long capituloId, Pageable pageable) {
        Page<ComentarioCapitulo> pagina = comentarioCapituloRepository
                .findByCapituloIdAndPadreIsNullOrderByCreatedAtDesc(capituloId, pageable);

        List<ComentarioCapituloResponseDTO> dtos = pagina.getContent()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, pagina.getTotalElements());
    }

    /**
     * Retorna el total de comentarios activos (no eliminados) de un capítulo.
     */
    @Transactional(readOnly = true)
    public long contarComentariosActivos(Long capituloId) {
        return comentarioCapituloRepository.countActivosByCapituloId(capituloId);
    }

    // ─── Escritura ────────────────────────────────────────────────────────────

    /**
     * Crea un comentario (raíz o respuesta) para un capítulo.
     *
     * @param capituloId ID del capítulo
     * @param mailAutor  mail del usuario autenticado (extraído del JWT)
     * @param dto        Datos del comentario (contenido + padreId opcional)
     */
    @Transactional
    public ComentarioCapituloResponseDTO crearComentario(Long capituloId, String mailAutor, ComentarioCapituloRequestDTO dto) {
        if (dto.contenido() == null || dto.contenido().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El contenido del comentario no puede estar vacío.");
        }

        Capitulo capitulo = capituloRepository.findById(capituloId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Capítulo no encontrado."));

        Usuario autor = usuarioRepository.findByMail(mailAutor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        ComentarioCapitulo comentario = new ComentarioCapitulo();
        comentario.setContenido(dto.contenido().trim());
        comentario.setCapitulo(capitulo);
        comentario.setAutor(autor);

        if (dto.padreId() != null) {
            ComentarioCapitulo padre = comentarioCapituloRepository.findById(dto.padreId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario padre no encontrado."));

            if (!padre.getCapitulo().getId().equals(capituloId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El comentario padre no pertenece a este capítulo.");
            }

            if (padre.isEliminado()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede responder a un comentario eliminado.");
            }

            comentario.setPadre(padre);
        }

        ComentarioCapitulo guardado = comentarioCapituloRepository.save(comentario);
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
        ComentarioCapitulo comentario = comentarioCapituloRepository.findById(comentarioId)
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
            comentarioCapituloRepository.save(comentario);
        } else {
            comentarioCapituloRepository.delete(comentario);
        }
    }

    // ─── Mapeo DTO (recursivo) ────────────────────────────────────────────────

    private ComentarioCapituloResponseDTO toDTO(ComentarioCapitulo c) {
        List<ComentarioCapituloResponseDTO> respuestasDTO = c.getRespuestas()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new ComentarioCapituloResponseDTO(
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
