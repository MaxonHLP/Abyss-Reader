package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Guardado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuardadoRepository extends JpaRepository<Guardado, Long> {

    /**
     * Busca un guardado por el mail del usuario y el ID de la obra.
     * Usado para el upsert: si existe se actualiza, si no se crea.
     */
    Optional<Guardado> findByUsuarioMailAndObraId(String mail, Long obraId);

    /**
     * Lista todos los guardados de un usuario ordenados por fecha de actualización descendente.
     */
    List<Guardado> findAllByUsuarioMailOrderByUpdatedAtDesc(String mail);

    /** Elimina el guardado de un usuario en una obra específica. */
    void deleteByUsuarioMailAndObraId(String mail, Long obraId);

    /** Elimina todos los guardados de una obra (usado al eliminar la obra). */
    void deleteAllByObraId(Long obraId);
    @Modifying
    @Query("DELETE FROM Guardado g WHERE g.usuario.id = :usuarioId")
    void deleteAllByUsuarioId(@Param("usuarioId") Long usuarioId);
}
