package com.abyssreader.api.repository;

import com.abyssreader.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByMail(String mail);
    Optional<Usuario> findByMail(String mail);
}
