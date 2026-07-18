package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    Optional<Grupo> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    /** Retorna todos los grupos creados por un usuario específico. Usado para el filtrado demo. */
    List<Grupo> findByCreadorId(Long creadorId);

    List<Grupo> findByActivoFalse();

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Grupo g WHERE g.creadorId = :usuarioId AND g.dataCore = false")
    void deleteAllByCreadorId(@Param("usuarioId") Long usuarioId);

    /**
     * Desactiva (soft-delete) todos los grupos de un creador en una sola sentencia SQL.
     * Al quedar activo=false, @SQLRestriction en la entidad Grupo los filtra
     * automáticamente de todas las consultas JPA.
     * No toca los grupos con dataCore=true para proteger el contenido de exhibición.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Grupo g SET g.activo = false WHERE g.creadorId = :usuarioId AND g.dataCore = false")
    void desactivarGruposPorCreador(@Param("usuarioId") Long usuarioId);
}
