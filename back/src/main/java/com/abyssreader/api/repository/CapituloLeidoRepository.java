package com.abyssreader.api.repository;

import com.abyssreader.api.entity.CapituloLeido;
import com.abyssreader.api.entity.CapituloLeidoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CapituloLeidoRepository extends JpaRepository<CapituloLeido, CapituloLeidoId> {
    
    Optional<CapituloLeido> findByIdUsuarioIdAndIdCapituloId(Long usuarioId, Long capituloId);
    
    List<CapituloLeido> findByIdUsuarioIdAndIdCapituloIdIn(Long usuarioId, List<Long> capituloIds);
    
    void deleteAllByIdCapituloId(Long capituloId);

    @Query("SELECT c.id.capituloId FROM CapituloLeido c WHERE c.id.usuarioId = :usuarioId AND c.id.capituloId IN :capitulosIds")
    List<Long> findLeidosByUsuarioAndCapitulos(@Param("usuarioId") Long usuarioId, @Param("capitulosIds") List<Long> capitulosIds);
}
