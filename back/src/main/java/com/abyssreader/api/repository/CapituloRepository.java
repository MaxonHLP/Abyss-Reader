package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Capitulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CapituloRepository extends JpaRepository<Capitulo, Long> {

    /** Busca un capítulo por el título de su obra y el número. */
    Optional<Capitulo> findByObraTituloAndNumero(String titulo, double numero);

    /** Lista todos los capítulos de una obra, ordenados de menor a mayor número. */
    java.util.List<Capitulo> findByObraIdOrderByNumeroAsc(Long obraId);

    /** Capítulo siguiente: número mayor más cercano en la misma obra. */
    Optional<Capitulo> findFirstByObraIdAndNumeroGreaterThanOrderByNumeroAsc(Long obraId, double numero);

    /** Capítulo anterior: número menor más cercano en la misma obra. */
    Optional<Capitulo> findFirstByObraIdAndNumeroLessThanOrderByNumeroDesc(Long obraId, double numero);
}
