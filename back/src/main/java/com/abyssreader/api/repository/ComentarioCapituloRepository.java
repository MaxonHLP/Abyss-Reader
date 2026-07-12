package com.abyssreader.api.repository;

import com.abyssreader.api.entity.ComentarioCapitulo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
