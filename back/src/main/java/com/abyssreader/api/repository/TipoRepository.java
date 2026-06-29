package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Tipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TipoRepository extends JpaRepository<Tipo, Long> {
    Optional<Tipo> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM tipos WHERE nombre = :nombre", nativeQuery = true)
    Optional<Tipo> findByNombreIncludingDeleted(@org.springframework.data.repository.query.Param("nombre") String nombre);
}
