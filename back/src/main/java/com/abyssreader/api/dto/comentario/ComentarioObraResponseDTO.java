package com.abyssreader.api.dto.comentario;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de respuesta para un comentario de obra.
 * Contiene sus propios hijos (respuestas) de forma recursiva.
 * Al ser un POJO plano (sin referencias a entidades JPA), no hay riesgo
 * de serialización circular por Jackson.
 *
 * @param id              ID del comentario
 * @param autorNombre     Nombre del autor
 * @param autorAvatar     URL del avatar del autor (puede ser null)
 * @param contenido       Texto del comentario (o "[Comentario eliminado]")
 * @param fechaCreacion   Timestamp de creación
 * @param eliminado       true si fue soft-deleted
 * @param respuestas      Lista de respuestas directas (recursiva)
 */
public record ComentarioObraResponseDTO(
        Long id,
        String autorNombre,
        String autorAvatar,
        String contenido,
        LocalDateTime fechaCreacion,
        boolean eliminado,
        List<ComentarioObraResponseDTO> respuestas
) {}
