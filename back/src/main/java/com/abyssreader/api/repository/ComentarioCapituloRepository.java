package com.abyssreader.api.repository;

import com.abyssreader.api.entity.ComentarioCapitulo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

public interface ComentarioCapituloRepository extends JpaRepository<ComentarioCapitulo, Long> {

    /**
     * Trae SOLO los comentarios raíz (sin padre) de un capítulo, paginados,
     * ordenados por fecha de creación descendente.
     */
    Page<ComentarioCapitulo> findByCapituloIdAndPadreIsNullOrderByCreatedAtDesc(Long capituloId, Pageable pageable);

    /**
     * Cuenta el total de comentarios activos de un capítulo (incluyendo respuestas)
     * para mostrar en el encabezado de la sección.
     * Solo cuenta los NO eliminados.
     */
    @Query("SELECT COUNT(c) FROM ComentarioCapitulo c WHERE c.capitulo.id = :capituloId AND c.eliminado = false")
    long countActivosByCapituloId(@Param("capituloId") Long capituloId);

    /** Obtiene todos los comentarios creados por un autor específico. Usado para limpieza demo. */
    java.util.List<ComentarioCapitulo> findByAutorId(Long autorId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ComentarioCapitulo c WHERE c.autor.id = :usuarioId")
    void deleteAllByAutorId(@Param("usuarioId") Long usuarioId);

    /**
     * Desactiva (soft-delete) todos los comentarios de capítulo de un autor.
     * Reutiliza el campo 'eliminado' ya existente para no duplicar el mecanismo.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ComentarioCapitulo c SET c.eliminado = true WHERE c.autor.id = :usuarioId")
    void desactivarComentariosPorAutor(@Param("usuarioId") Long usuarioId);
}
