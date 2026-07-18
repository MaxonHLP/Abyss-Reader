package com.abyssreader.api.repository;

import com.abyssreader.api.dto.obra.UltimoCapituloDTO;
import com.abyssreader.api.entity.Capitulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CapituloRepository extends JpaRepository<Capitulo, Long> {

    /** Busca un capítulo por el título de su obra y el número. */
    Optional<Capitulo> findByObraTituloAndNumero(String titulo, double numero);

    /** Verifica si ya existe un capítulo con ese número en la obra. */
    boolean existsByObraIdAndNumero(Long obraId, double numero);

    /** Lista todos los capítulos de una obra, ordenados de menor a mayor número. */
    List<Capitulo> findByObraIdOrderByNumeroAsc(Long obraId);

    /** Capítulo siguiente: número mayor más cercano en la misma obra. */
    Optional<Capitulo> findFirstByObraIdAndNumeroGreaterThanOrderByNumeroAsc(Long obraId, double numero);

    /** Capítulo anterior: número menor más cercano en la misma obra. */
    Optional<Capitulo> findFirstByObraIdAndNumeroLessThanOrderByNumeroDesc(Long obraId, double numero);

    /** Obtiene todos los capítulos creados por un usuario específico. Usado para limpieza demo. */
    List<Capitulo> findByCreadorId(Long creadorId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Capitulo c WHERE c.creadorId = :usuarioId AND c.dataCore = false")
    void deleteAllByCreadorId(@Param("usuarioId") Long usuarioId);

    /**
     * Devuelve los 2 últimos capítulos de una obra directamente desde PostgreSQL,
     * ordenados por número descendente. Evita el anti-patrón de cargar TODOS los
     * capítulos en memoria Java solo para quedarse con los 2 últimos.
     *
     * Se usa en ObraService.mapToDTO() para construir el campo ultimosCapitulos.
     */
    @Query("""
            SELECT new com.abyssreader.api.dto.obra.UltimoCapituloDTO(c.numero, c.createdAt)
            FROM Capitulo c
            WHERE c.obra.id = :obraId
            ORDER BY c.numero DESC
            LIMIT 2
            """)
    List<UltimoCapituloDTO> findUltimosCapitulosByObraId(@Param("obraId") Long obraId);
}

