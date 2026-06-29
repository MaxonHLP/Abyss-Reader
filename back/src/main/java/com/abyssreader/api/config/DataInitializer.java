package com.abyssreader.api.config;

import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String masterEmail = "lord@abyss.com";
        if (!usuarioRepository.existsByMail(masterEmail)) {
            Usuario master = new Usuario();
            master.setNombre("Lord of Abyss");
            master.setMail(masterEmail);
            master.setContrasena(passwordEncoder.encode("123456"));
            master.setRol(Rol.MASTER);
            try {
                usuarioRepository.save(master);
                System.out.println("Usuario MASTER creado: " + masterEmail + " / 123456");
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                System.out.println(
                        "El usuario MASTER ya existe en la BD (posiblemente inactivo). Saltando inicialización.");
            }
        }
    }
}
