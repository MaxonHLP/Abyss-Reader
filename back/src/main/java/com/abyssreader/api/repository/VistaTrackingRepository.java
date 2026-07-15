package com.abyssreader.api.repository;

import com.abyssreader.api.entity.VistaTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface VistaTrackingRepository extends JpaRepository<VistaTracking, Long> {

    boolean existsByUsuarioIdAndCapituloIdAndFechaCreacionAfter(Long usuarioId, Long capituloId, LocalDateTime limite);

    @Modifying
    @Query("DELETE FROM VistaTracking v WHERE v.fechaCreacion < :limite")
    void deleteOlderThan(@Param("limite") LocalDateTime limite);

    /**
     * Elimina todas las vistas asociadas a un capítulo.
     */
    void deleteAllByCapituloId(Long capituloId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM VistaTracking v WHERE v.usuarioId = :usuarioId")
    void deleteAllByUsuarioId(@Param("usuarioId") Long usuarioId);
}
