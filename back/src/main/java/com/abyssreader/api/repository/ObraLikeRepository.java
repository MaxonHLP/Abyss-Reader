package com.abyssreader.api.repository;

import com.abyssreader.api.entity.ObraLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ObraLikeRepository extends JpaRepository<ObraLike, Long> {

    boolean existsByObraIdAndUsuarioId(Long obraId, Long usuarioId);

    void deleteByObraIdAndUsuarioId(Long obraId, Long usuarioId);

    void deleteAllByObraId(Long obraId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ObraLike ol WHERE ol.usuario.id = :usuarioId")
    void deleteAllByUsuarioId(@Param("usuarioId") Long usuarioId);
}
