package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long>, JpaSpecificationExecutor<Obra> {
    Optional<Obra> findByTitulo(String titulo);
    boolean existsByTitulo(String titulo);

    /** Incremento atómico de vistas — seguro ante condiciones de carrera */
    @Modifying
    @Query("UPDATE Obra o SET o.vistas = o.vistas + 1 WHERE o.id = :id")
    void incrementarVistas(@Param("id") Long id);

    /** Incremento atómico de likes */
    @Modifying
    @Query("UPDATE Obra o SET o.likes = o.likes + 1 WHERE o.id = :id")
    void incrementarLikes(@Param("id") Long id);

    /** Decremento atómico de likes (con floor a 0 para evitar negativos) */
    @Modifying
    @Query("UPDATE Obra o SET o.likes = GREATEST(o.likes - 1, 0) WHERE o.id = :id")
    void decrementarLikes(@Param("id") Long id);

    /** Obtiene las obras ordenadas por el capítulo más reciente */
    @Query("SELECT o FROM Obra o JOIN o.capitulos c GROUP BY o.id ORDER BY MAX(c.createdAt) DESC")
    org.springframework.data.domain.Page<Obra> findByOrderByUltimoCapituloDesc(org.springframework.data.domain.Pageable pageable);

    /** Limpia las asociaciones de un miembro en la tabla intermedia obra_staff antes de eliminarlo */
    @Modifying
    @Query(value = "DELETE FROM obra_staff WHERE miembro_id = :miembroId", nativeQuery = true)
    void removeMiembroFromAllObras(@Param("miembroId") Long miembroId);
}

