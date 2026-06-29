package com.abyssreader.api.repository;

import com.abyssreader.api.entity.ObraLike;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ObraLikeRepository extends JpaRepository<ObraLike, Long> {

    boolean existsByObraIdAndUsuarioId(Long obraId, Long usuarioId);

    void deleteByObraIdAndUsuarioId(Long obraId, Long usuarioId);

    void deleteAllByObraId(Long obraId);
}
