package com.abyssreader.api.service;

import com.abyssreader.api.dto.grupo.MiembroRequestDTO;
import com.abyssreader.api.dto.grupo.MiembroResponseDTO;
import com.abyssreader.api.entity.Grupo;
import com.abyssreader.api.entity.Miembro;
import com.abyssreader.api.exception.DuplicateResourceException;
import com.abyssreader.api.repository.GrupoRepository;
import com.abyssreader.api.repository.MiembroRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.Rol;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.exception.DemoIsolationException;

@Service
@RequiredArgsConstructor
public class MiembroService {

    private final MiembroRepository miembroRepository;
    private final GrupoRepository grupoRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.abyssreader.api.repository.ObraRepository obraRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MiembroResponseDTO createMiembro(MiembroRequestDTO request) {
        // Validar que el mail no exista ya en usuarios
        if (usuarioRepository.existsByMail(request.getMail())) {
            throw new DuplicateResourceException("El correo electrónico '" + request.getMail() + "' ya está en uso.");
        }

        // Validar que el rol sea uno de los permitidos para miembros
        Rol rolParsed;
        try {
            rolParsed = Rol.valueOf(request.getRol().toUpperCase());
            if (rolParsed != Rol.MIEMBRO && rolParsed != Rol.MIEMBRO_ADMIN) {
                throw new IllegalArgumentException("Rol no permitido: " + request.getRol());
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Rol inválido. Los valores permitidos son: MIEMBRO, MIEMBRO_ADMIN");
        }

        // Obtener el grupo al que pertenecerá
        Grupo grupo = grupoRepository.findById(request.getGrupoId())
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado con id: " + request.getGrupoId()));

        // Crear el miembro
        Miembro miembro = new Miembro();
        miembro.setNombre(request.getNombre());
        miembro.setMail(request.getMail());
        miembro.setContrasena(passwordEncoder.encode(request.getContrasena()));
        miembro.setRol(rolParsed);
        miembro.setGrupo(grupo);

        // Herencia de Demo e Isolation check
        String creadorMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario creador = usuarioRepository.findByMail(creadorMail).orElse(null);
        if (creador != null) {
            if (Boolean.TRUE.equals(creador.getEsDemo())) {
                if (creador.getRol() == Rol.MASTER) {
                    if (!creador.getId().equals(grupo.getCreadorId())) {
                        throw new DemoIsolationException();
                    }
                } else if (creador instanceof Miembro) {
                    Miembro creadorMiembro = (Miembro) creador;
                    if (creadorMiembro.getGrupo() == null || !creadorMiembro.getGrupo().getId().equals(grupo.getId())) {
                        throw new DemoIsolationException();
                    }
                }
            }
            miembro.setEsDemo(creador.getEsDemo());
        }

        Miembro savedMiembro = miembroRepository.save(miembro);
        return mapToDTO(savedMiembro);
    }

    @Transactional
    public void deleteMiembro(Long id) {
        Miembro miembro = miembroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Miembro no encontrado con id: " + id));
        
        String authMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByMail(authMail).orElse(null);
        if (usuario != null && Boolean.TRUE.equals(usuario.getEsDemo())) {
            Grupo grupo = miembro.getGrupo();
            if (grupo != null) {
                if (usuario.getRol() == Rol.MASTER) {
                    if (!usuario.getId().equals(grupo.getCreadorId())) {
                        throw new DemoIsolationException();
                    }
                } else if (usuario instanceof Miembro) {
                    Miembro userMiembro = (Miembro) usuario;
                    if (userMiembro.getGrupo() == null || !userMiembro.getGrupo().getId().equals(grupo.getId())) {
                        throw new DemoIsolationException();
                    }
                }
            }
        }
        
        // Limpiar la tabla intermedia obra_staff para evitar violación de llave foránea
        obraRepository.removeMiembroFromAllObras(id);

        miembroRepository.delete(miembro);
    }

    private MiembroResponseDTO mapToDTO(Miembro miembro) {
        return new MiembroResponseDTO(
                miembro.getId(),
                miembro.getNombre(),
                miembro.getMail(),
                miembro.getRol().name(),
                miembro.getFotoPerfil(),
                miembro.getGrupo() != null ? miembro.getGrupo().getId() : null,
                miembro.getGrupo() != null ? miembro.getGrupo().getNombre() : null
        );
    }
}
