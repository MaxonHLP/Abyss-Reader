package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Comentario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    /**
     * Trae SOLO los comentarios raíz (sin padre) de una obra, paginados,
     * ordenados por fecha de creación descendente.
     * Las respuestas anidadas son cargadas en cascada por JPA al acceder
     * a la colección 'respuestas' (EAGER implícito vía OneToMany).
     */
    Page<Comentario> findByObraIdAndPadreIsNullOrderByCreatedAtDesc(Long obraId, Pageable pageable);

    /**
     * Cuenta el total de comentarios de una obra (incluyendo respuestas)
     * para mostrar en el encabezado de la sección.
     * Solo cuenta los NO eliminados para dar un número significativo al usuario.
     */
    @Query("SELECT COUNT(c) FROM Comentario c WHERE c.obra.id = :obraId AND c.eliminado = false")
    long countActivosByObraId(@Param("obraId") Long obraId);
}
