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
        crearUsuarioSiNoExiste("Lector@demo.com", "Un NPC mas del abismo", "123456", Rol.LECTOR);
        crearUsuarioSiNoExiste("MiembroAd@demo.com", "Un Esbirro Lider", "123456", Rol.MIEMBRO_ADMIN);
        crearUsuarioSiNoExiste("Master@demo.com", "Lord Of Abyss", "123456", Rol.MASTER);
    }

    private void crearUsuarioSiNoExiste(String mail, String nombre, String contrasena, Rol rol) {
        if (!usuarioRepository.existsByMail(mail)) {
            Usuario usuario = new Usuario();
            usuario.setMail(mail);
            usuario.setNombre(nombre);
            usuario.setContrasena(passwordEncoder.encode(contrasena));
            usuario.setRol(rol);
            usuario.setActivo(true);
            usuarioRepository.save(usuario);
        }
    }
}
