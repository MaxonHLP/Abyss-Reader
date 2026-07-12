package com.abyssreader.api.dto.comentario;

/**
 * DTO de entrada para crear un comentario de obra.
 *
 * @param contenido Texto del comentario. Requerido.
 * @param padreId   ID del comentario padre. NULL = comentario raíz.
 */
public record ComentarioObraRequestDTO(String contenido, Long padreId) {}
