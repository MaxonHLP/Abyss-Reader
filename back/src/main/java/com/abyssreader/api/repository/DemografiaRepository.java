package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Demografia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DemografiaRepository extends JpaRepository<Demografia, Long> {
    Optional<Demografia> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM demografias WHERE nombre = :nombre", nativeQuery = true)
    Optional<Demografia> findByNombreIncludingDeleted(@org.springframework.data.repository.query.Param("nombre") String nombre);
}
