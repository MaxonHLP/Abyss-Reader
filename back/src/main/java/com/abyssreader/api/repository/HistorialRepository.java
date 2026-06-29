package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Historial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialRepository extends JpaRepository<Historial, Long> {

    /**
     * Busca un historial por el mail del usuario y el ID de la obra.
     * Usado para el upsert: si existe se actualiza el capítulo, si no se crea.
     */
    Optional<Historial> findByUsuarioMailAndObraId(String mail, Long obraId);

    /**
     * Lista todo el historial de un usuario ordenado por fecha de actualización descendente.
     * Garantiza que el capítulo leído más recientemente aparezca primero.
     */
    List<Historial> findAllByUsuarioMailOrderByUpdatedAtDesc(String mail);

    /**
     * Elimina todos los historiales asociados a un capítulo.
     */
    void deleteAllByCapituloId(Long capituloId);

    /**
     * Elimina todos los historiales asociados a una obra.
     */
    void deleteAllByObraId(Long obraId);
}
