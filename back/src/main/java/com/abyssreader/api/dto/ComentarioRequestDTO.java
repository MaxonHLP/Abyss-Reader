package com.abyssreader.api.dto;

/**
 * DTO de entrada para crear un comentario.
 *
 * @param contenido Texto del comentario. Requerido.
 * @param padreId   ID del comentario padre. NULL = comentario raíz.
 */
public record ComentarioRequestDTO(String contenido, Long padreId) {}
