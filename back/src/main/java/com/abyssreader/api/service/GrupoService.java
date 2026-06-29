package com.abyssreader.api.service;

import com.abyssreader.api.dto.grupo.GrupoRequestDTO;
import com.abyssreader.api.dto.grupo.GrupoResponseDTO;
import com.abyssreader.api.dto.grupo.GrupoDetalleDTO;
import com.abyssreader.api.dto.grupo.ObraResumenDTO;
import com.abyssreader.api.dto.grupo.MiembroResumenDTO;
import com.abyssreader.api.exception.DuplicateResourceException;
import com.abyssreader.api.entity.Grupo;
import com.abyssreader.api.repository.GrupoRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.util.Rol;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrupoService {

    private final GrupoRepository grupoRepository;
    private final StorageService storageService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public GrupoResponseDTO createGrupo(GrupoRequestDTO request, MultipartFile portada) {
        if (grupoRepository.existsByNombre(request.getNombre())) {
            throw new DuplicateResourceException("Ya existe un Grupo con ese nombre");
        }
        
        Grupo grupo = new Grupo();
        grupo.setNombre(request.getNombre());
        grupo.setDescripcion(request.getDescripcion());
        
        Grupo savedGrupo = grupoRepository.save(grupo);

        if (portada != null && !portada.isEmpty()) {
            String folderPath = "grupos/" + savedGrupo.getId() + "/portada/";
            String url = storageService.uploadFile(portada, folderPath);
            savedGrupo.setPortada(url);
            savedGrupo = grupoRepository.save(savedGrupo);
        }
        
        return mapToDTO(savedGrupo);
    }

    @Transactional(readOnly = true)
    public GrupoDetalleDTO getGrupoById(Long id) {
        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado con id: " + id));
        
        List<ObraResumenDTO> obrasDTO = grupo.getObras().stream()
                .map(obra -> new ObraResumenDTO(obra.getId(), obra.getTitulo(), obra.getPortada(), obra.getVistas(), obra.getLikes()))
                .collect(Collectors.toList());
                
        List<MiembroResumenDTO> miembrosDTO = grupo.getMiembros().stream()
                .map(miembro -> new MiembroResumenDTO(miembro.getId(), miembro.getNombre(), miembro.getRol().name(), miembro.getFotoPerfil()))
                .collect(Collectors.toList());
                
        return new GrupoDetalleDTO(
                grupo.getId(),
                grupo.getNombre(),
                grupo.getDescripcion(),
                grupo.getPortada(),
                obrasDTO,
                miembrosDTO
        );
    }

    @Transactional(readOnly = true)
    public List<GrupoResponseDTO> getAllGrupos() {
        return grupoRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GrupoResponseDTO updateGrupo(Long id, GrupoRequestDTO request, MultipartFile portada) {
        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado con id: " + id));

        if (!grupo.getNombre().equalsIgnoreCase(request.getNombre()) && grupoRepository.existsByNombre(request.getNombre())) {
            throw new DuplicateResourceException("Ya existe un Grupo con ese nombre");
        }

        grupo.setNombre(request.getNombre());
        grupo.setDescripcion(request.getDescripcion());

        if (portada != null && !portada.isEmpty()) {
            if (grupo.getPortada() != null && !grupo.getPortada().isEmpty()) {
                try {
                    storageService.deleteFile(grupo.getPortada());
                } catch (Exception e) {
                    System.err.println("No se pudo eliminar la portada antigua de GCS: " + e.getMessage());
                }
            }
            String folderPath = "grupos/" + grupo.getId() + "/portada/";
            String url = storageService.uploadFile(portada, folderPath);
            grupo.setPortada(url);
        }

        return mapToDTO(grupoRepository.save(grupo));
    }

    @Transactional
    public void deleteGrupo(Long id, String masterPassword) {
        Grupo grupo = grupoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Grupo no encontrado con id: " + id));
        
        String authMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByMail(authMail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        if (usuario.getRol() != Rol.MASTER) {
            throw new RuntimeException("Solo el rol MASTER puede eliminar un grupo");
        }

        if (!passwordEncoder.matches(masterPassword, usuario.getContrasena())) {
            throw new RuntimeException("Contraseña de MASTER incorrecta");
        }

        // Purgar de GCS la portada del grupo
        if (grupo.getPortada() != null && !grupo.getPortada().isEmpty()) {
            try {
                storageService.deleteFile(grupo.getPortada());
            } catch (Exception e) {
                System.err.println("Error al borrar portada del grupo de GCS: " + grupo.getPortada());
            }
        }

        grupoRepository.delete(grupo);
    }

    private GrupoResponseDTO mapToDTO(Grupo grupo) {
        return new GrupoResponseDTO(
                grupo.getId(),
                grupo.getNombre(),
                grupo.getDescripcion(),
                grupo.getPortada()
        );
    }
}
