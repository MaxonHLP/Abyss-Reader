package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Genero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeneroRepository extends JpaRepository<Genero, Long> {
    Optional<Genero> findByNombre(String nombre);
    boolean existsByNombre(String nombre);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM generos WHERE nombre = :nombre", nativeQuery = true)
    Optional<Genero> findByNombreIncludingDeleted(@org.springframework.data.repository.query.Param("nombre") String nombre);
}
