package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByMail(String mail);
    Optional<Usuario> findByMail(String mail);

    /**
     * Cuenta las cuentas demo efímeras activas (no expiradas).
     * Usado para verificar el cap de 50 demos simultáneos.
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.esDemo = true AND u.expiracionDemo IS NOT NULL AND u.expiracionDemo > :ahora AND u.activo = true")
    long countDemosActivosAhora(@Param("ahora") LocalDateTime ahora);

    /**
     * Obtiene todos los usuarios demo efímeros cuya expiración ya pasó pero aún están activos.
     * Usamos JPQL para que Hibernate maneje correctamente la herencia JOINED (MIEMBRO vs USUARIO).
     * La @SQLRestriction("activo = true") aplica aquí, lo cual es correcto porque buscamos
     * demos ACTIVOS que ya expiraron (no los ya eliminados).
     */
    @Query("SELECT u FROM Usuario u WHERE u.esDemo = true AND u.expiracionDemo IS NOT NULL AND u.expiracionDemo < :ahora")
    List<Usuario> findDemosExpirados(@Param("ahora") LocalDateTime ahora);

    /**
     * Busca un usuario demo por su hash de reinitToken.
     * Permite reutilizar la misma cuenta demo al volver a la sesión.
     */
    Optional<Usuario> findByReinitToken(String reinitToken);

    // =========================================================================
    // Contadores demo — Incremento atómico para evitar race conditions
    // =========================================================================

    @Modifying
    @Query("UPDATE Usuario u SET u.gruposCreados = u.gruposCreados + 1 WHERE u.id = :id")
    void incrementarGruposCreados(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Usuario u SET u.obrasCreadas = u.obrasCreadas + 1 WHERE u.id = :id")
    void incrementarObrasCreadas(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Usuario u SET u.capitulosCreados = u.capitulosCreados + 1 WHERE u.id = :id")
    void incrementarCapitulosCreados(@Param("id") Long id);
}
