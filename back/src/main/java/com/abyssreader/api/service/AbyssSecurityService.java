package com.abyssreader.api.service;

import com.abyssreader.api.entity.Miembro;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.MiembroRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("abyssSecurityService")
@RequiredArgsConstructor
public class AbyssSecurityService {

    private final UsuarioRepository usuarioRepository;
    private final MiembroRepository miembroRepository;
    private final ObraRepository obraRepository;

    public boolean canManageGrupo(Authentication authentication, Long grupoId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        String mail = authentication.getName();
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMail(mail);
        if (usuarioOpt.isEmpty()) return false;
        
        Usuario usuario = usuarioOpt.get();
        if (usuario.getRol() == Rol.MASTER) return true;
        
        if (usuario.getRol() == Rol.MIEMBRO_ADMIN && usuario instanceof Miembro) {
            Miembro miembro = (Miembro) usuario;
            return miembro.getGrupo() != null && miembro.getGrupo().getId().equals(grupoId);
        }
        
        return false;
    }

    public boolean canManageObra(Authentication authentication, Long obraId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        String mail = authentication.getName();
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMail(mail);
        if (usuarioOpt.isEmpty()) return false;
        
        Usuario usuario = usuarioOpt.get();
        if (usuario.getRol() == Rol.MASTER) return true;
        
        Optional<Obra> obraOpt = obraRepository.findById(obraId);
        if (obraOpt.isEmpty()) return false;
        Obra obra = obraOpt.get();
        
        if (obra.getGrupo() == null) return false;
        Long obraGrupoId = obra.getGrupo().getId();
        
        if (usuario instanceof Miembro) {
            Miembro miembro = (Miembro) usuario;
            // Tiene que ser del mismo grupo
            if (miembro.getGrupo() == null || !miembro.getGrupo().getId().equals(obraGrupoId)) {
                return false;
            }
            
            if (usuario.getRol() == Rol.MIEMBRO_ADMIN) {
                return true; // Admin del grupo de la obra puede editar
            }
            
            if (usuario.getRol() == Rol.MIEMBRO) {
                // Miembro regular debe ser parte del staff de la obra
                return obra.getStaff().stream().anyMatch(staffMiembro -> staffMiembro.getId().equals(miembro.getId()));
            }
        }
        
        return false;
    }

    public boolean canDeleteMiembro(Authentication authentication, Long miembroAEliminarId) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        String mail = authentication.getName();
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByMail(mail);
        if (usuarioOpt.isEmpty()) return false;
        Usuario actualUsuario = usuarioOpt.get();
        
        if (actualUsuario.getRol() == Rol.MASTER) return true; // Master puede borrar a cualquiera
        
        Optional<Miembro> miembroTargetOpt = miembroRepository.findById(miembroAEliminarId);
        if (miembroTargetOpt.isEmpty()) return false;
        Miembro target = miembroTargetOpt.get();
        
        // Admin intentando borrar a otro Admin no está permitido
        if (target.getRol() == Rol.MIEMBRO_ADMIN) return false;
        
        if (actualUsuario.getRol() == Rol.MIEMBRO_ADMIN && actualUsuario instanceof Miembro) {
            Miembro actor = (Miembro) actualUsuario;
            if (actor.getGrupo() != null && target.getGrupo() != null) {
                return actor.getGrupo().getId().equals(target.getGrupo().getId());
            }
        }
        
        return false;
    }
}
