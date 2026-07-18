package com.abyssreader.api.repository;

import com.abyssreader.api.entity.ComentarioObra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;

public interface ComentarioObraRepository extends JpaRepository<ComentarioObra, Long> {

    /**
     * Trae SOLO los comentarios raíz (sin padre) de una obra, paginados,
     * ordenados por fecha de creación descendente.
     * Las respuestas anidadas son cargadas en cascada por JPA al acceder
     * a la colección 'respuestas' (EAGER implícito vía OneToMany).
     */
    Page<ComentarioObra> findByObraIdAndPadreIsNullOrderByCreatedAtDesc(Long obraId, Pageable pageable);

    /**
     * Cuenta el total de comentarios activos de una obra (incluyendo respuestas)
     * para mostrar en el encabezado de la sección.
     * Solo cuenta los NO eliminados para dar un número significativo al usuario.
     */
    @Query("SELECT COUNT(c) FROM ComentarioObra c WHERE c.obra.id = :obraId AND c.eliminado = false")
    long countActivosByObraId(@Param("obraId") Long obraId);

    /** Obtiene todos los comentarios creados por un autor específico. Usado para limpieza demo. */
    java.util.List<ComentarioObra> findByAutorId(Long autorId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ComentarioObra c WHERE c.autor.id = :usuarioId")
    void deleteAllByAutorId(@Param("usuarioId") Long usuarioId);

    /**
     * Desactiva (soft-delete) todos los comentarios de un autor en una sola sentencia.
     * Reutiliza el campo 'eliminado' ya existente en la entidad para no duplicar
     * el mecanismo de borrado lógico. Los comentarios siguen visibles en el árbol
     * de respuestas como "[Comentario eliminado]" según la lógica del Frontend.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ComentarioObra c SET c.eliminado = true WHERE c.autor.id = :usuarioId")
    void desactivarComentariosPorAutor(@Param("usuarioId") Long usuarioId);
}
