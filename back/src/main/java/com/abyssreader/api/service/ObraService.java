package com.abyssreader.api.service;

import com.abyssreader.api.dto.obra.ObraRequestDTO;
import com.abyssreader.api.dto.obra.ObraResponseDTO;
import com.abyssreader.api.entity.*;
import com.abyssreader.api.repository.*;
import com.abyssreader.api.entity.Capitulo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.abyssreader.api.exception.DemoLimitException;
import com.abyssreader.api.exception.DemoIsolationException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.abyssreader.api.repository.specification.ObraSpecification;

@Service
@RequiredArgsConstructor
public class ObraService {

    private final ObraRepository obraRepository;
    private final TipoRepository tipoRepository;
    private final DemografiaRepository demografiaRepository;
    private final GrupoRepository grupoRepository;
    private final GeneroRepository generoRepository;
    private final MiembroRepository miembroRepository;
    private final StorageService storageService;
    private final GuardadoRepository guardadoRepository;
    private final HistorialRepository historialRepository;
    private final ObraLikeRepository obraLikeRepository;
    private final UsuarioRepository usuarioRepository;


    @Transactional
    public ObraResponseDTO createObra(ObraRequestDTO request, MultipartFile portada) {
        if (obraRepository.existsByTitulo(request.getTitulo())) {
            throw new RuntimeException("Ya existe una Obra con ese título");
        }

        String authMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByMail(authMail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.TRUE.equals(usuario.getEsDemo())) {
            if (usuario.getObrasCreadas() != null && usuario.getObrasCreadas() >= 3) {
                throw new DemoLimitException("Obras", 3);
            }
        }

        Obra obra = new Obra();
        obra.setTitulo(request.getTitulo());
        obra.setDescripcion(request.getDescripcion());
        obra.setCreadorId(usuario.getId());
        
        try {
            Tipo tipo = tipoRepository.getReferenceById(request.getTipoId());
            Demografia demografia = demografiaRepository.getReferenceById(request.getDemografiaId());
            Grupo grupo = grupoRepository.getReferenceById(request.getGrupoId());
            
            obra.setTipo(tipo);
            obra.setDemografia(demografia);
            obra.setGrupo(grupo);

            Set<Genero> generos = request.getGenerosIds().stream()
                    .map(generoRepository::getReferenceById)
                    .collect(Collectors.toSet());
            
            obra.setGeneros(generos);

            if (request.getStaffIds() != null && !request.getStaffIds().isEmpty()) {
                Set<Miembro> staff = request.getStaffIds().stream()
                        .map(id -> miembroRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Miembro no encontrado con id " + id)))
                        .collect(Collectors.toSet());
                
                boolean allSameGroup = staff.stream().allMatch(m -> m.getGrupo() != null && m.getGrupo().getId().equals(grupo.getId()));
                if (!allSameGroup) {
                    throw new RuntimeException("Todo el staff asignado debe pertenecer al grupo de la obra.");
                }

                Usuario creadorGrupo = usuarioRepository.findById(grupo.getCreadorId()).orElse(null);
                if (creadorGrupo != null && Boolean.TRUE.equals(creadorGrupo.getEsDemo())) {
                    if (!usuario.getId().equals(creadorGrupo.getId())) {
                        throw new DemoIsolationException();
                    }
                }
                
                obra.setStaff(staff);
            }
        } catch (jakarta.persistence.EntityNotFoundException e) {
            throw new EntityNotFoundException("Uno o más identificadores proporcionados (Tipo, Demografía, Grupo o Géneros) no existen.");
        }

        if (Boolean.TRUE.equals(usuario.getEsDemo())) {
            usuarioRepository.incrementarObrasCreadas(usuario.getId());
        }

        // Guardar primero para obtener el ID generado
        Obra savedObra = obraRepository.save(obra);

        // Si hay portada, subirla usando el ID y actualizar
        if (portada != null && !portada.isEmpty()) {
            String folderPath = "obras/" + savedObra.getId() + "/portada/";
            String url = storageService.uploadFile(portada, folderPath);
            savedObra.setPortada(url);
            // El guardado final se hace por el flush de la transacción o podemos llamar a save() de nuevo
            savedObra = obraRepository.save(savedObra);
        }

        return mapToDTO(savedObra);
    }

    @Transactional
    public ObraResponseDTO editObra(Long id, com.abyssreader.api.dto.obra.ObraEditRequestDTO request, MultipartFile portadaNueva) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada con id: " + id));

        String authMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByMail(authMail).orElse(null);
        if (usuario != null && Boolean.TRUE.equals(usuario.getEsDemo())) {
            if (Boolean.TRUE.equals(obra.getDataCore())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DEMO_RESTRICTION");
            }
            if (!usuario.getId().equals(obra.getCreadorId())) {
                throw new DemoIsolationException();
            }
        }

        obra.setTitulo(request.getTitulo());
        obra.setDescripcion(request.getDescripcion());
        obra.setEstado(request.getEstado());

        try {
            Set<Genero> generos = request.getGenerosIds().stream()
                    .map(generoRepository::getReferenceById)
                    .collect(Collectors.toSet());
            obra.setGeneros(generos);

            if (request.getStaffIds() != null) {
                Set<Miembro> staff = request.getStaffIds().stream()
                        .map(staffId -> miembroRepository.findById(staffId).orElseThrow(() -> new EntityNotFoundException("Miembro no encontrado con id " + staffId)))
                        .collect(Collectors.toSet());
                
                boolean allSameGroup = staff.stream().allMatch(m -> m.getGrupo() != null && m.getGrupo().getId().equals(obra.getGrupo().getId()));
                if (!allSameGroup) {
                    throw new RuntimeException("Todo el staff asignado debe pertenecer al grupo de la obra.");
                }

                Usuario creadorGrupo = usuarioRepository.findById(obra.getGrupo().getCreadorId()).orElse(null);
                if (creadorGrupo != null && Boolean.TRUE.equals(creadorGrupo.getEsDemo())) {
                    if (usuario == null || !usuario.getId().equals(creadorGrupo.getId())) {
                        throw new DemoIsolationException();
                    }
                }

                obra.setStaff(staff);
            }
        } catch (jakarta.persistence.EntityNotFoundException e) {
            throw new EntityNotFoundException("Uno o más identificadores de géneros proporcionados no existen.");
        }

        if (portadaNueva != null && !portadaNueva.isEmpty()) {
            // Eliminar portada vieja si existe
            if (obra.getPortada() != null && !obra.getPortada().isEmpty()) {
                try {
                    storageService.deleteFile(obra.getPortada());
                } catch (Exception e) {
                    System.err.println("No se pudo eliminar la portada antigua de GCS: " + e.getMessage());
                }
            }
            // Subir nueva portada
            String folderPath = "obras/" + obra.getId() + "/portada/";
            String nuevaUrl = storageService.uploadFile(portadaNueva, folderPath);
            obra.setPortada(nuevaUrl);
        }

        Obra savedObra = obraRepository.save(obra);
        return mapToDTO(savedObra);
    }

    /**
     * Elimina una obra de forma definitiva (hard delete).
     * El orden del algoritmo es innegociable:
     * 1. Verificar que el usuario es MASTER y que la contraseña es correcta.
     * 2. Purgar de GCS las páginas de todos sus capítulos.
     * 3. Purgar de GCS la portada de la obra.
     * 4. Eliminar todos los guardados asociados a la obra.
     * 5. Destruir la raíz (obraRepository.delete): Hibernate en cascada borra capítulos y likes.
     */
    @Transactional
    public void eliminarObra(Long obraId) {
        String authMail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByMail(authMail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));


        Obra obra = obraRepository.findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada con id: " + obraId));

        if (Boolean.TRUE.equals(usuario.getEsDemo())) {
            if (Boolean.TRUE.equals(obra.getDataCore())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "DEMO_RESTRICTION");
            }
            if (!usuario.getId().equals(obra.getCreadorId())) {
                throw new DemoIsolationException();
            }
        }

        // Paso 2 — Purgar GCS: páginas de todos los capítulos
        for (Capitulo capitulo : obra.getCapitulos()) {
            for (String url : capitulo.getPaginasUrls()) {
                try {
                    storageService.deleteFile(url);
                } catch (Exception e) {
                    System.err.println("Error al borrar página de GCS: " + url);
                }
            }
        }

        // Paso 3 — Purgar GCS: portada de la obra
        if (obra.getPortada() != null && !obra.getPortada().isEmpty()) {
            try {
                storageService.deleteFile(obra.getPortada());
            } catch (Exception e) {
                System.err.println("Error al borrar portada de GCS: " + obra.getPortada());
            }
        }

        // Paso 4 — Eliminar entidades vinculadas (Guardados, Historiales, Likes)
        guardadoRepository.deleteAllByObraId(obraId);
        historialRepository.deleteAllByObraId(obraId);
        obraLikeRepository.deleteAllByObraId(obraId);

        // Paso 5 — Destruir la raíz (cascada elimina capítulos y géneros/staff)
        obraRepository.delete(obra);
    }


    @Transactional(readOnly = true)
    public ObraResponseDTO getObraById(Long id) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada con id: " + id));
        return mapToDTO(obra);
    }

    @Transactional(readOnly = true)
    public ObraResponseDTO getObraByTitulo(String titulo) {
        Obra obra = obraRepository.findByTitulo(titulo)
                .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada con titulo: " + titulo));
        return mapToDTO(obra);
    }

    @Transactional(readOnly = true)
    public List<ObraResponseDTO> getAllObras() {
        return obraRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ObraResponseDTO> obtenerCatalogoPaginado(String titulo, List<Long> tiposIds, List<Long> demografiasIds, List<Long> generosIds, List<com.abyssreader.api.util.EstadoObra> estados, Pageable pageable) {
        Specification<Obra> spec = Specification.allOf(
                ObraSpecification.conTituloLike(titulo),
                ObraSpecification.conTipos(tiposIds),
                ObraSpecification.conDemografias(demografiasIds),
                ObraSpecification.conGeneros(generosIds),
                ObraSpecification.conEstados(estados)
        );

        Page<Obra> pageObras = obraRepository.findAll(spec, pageable);
        return pageObras.map(this::mapToDTO);
    }

    public Page<ObraResponseDTO> obtenerObrasRecientes(Pageable pageable) {
        Page<Obra> pageObras = obraRepository.findByOrderByUltimoCapituloDesc(pageable);
        return pageObras.map(this::mapToDTO);
    }

    private ObraResponseDTO mapToDTO(Obra obra) {
        return new ObraResponseDTO(
                obra.getId(),
                obra.getTitulo(),
                obra.getDescripcion(),
                obra.getPortada(),
                obra.getVistas(),
                obra.getLikes(),
                obra.getEstado() != null ? obra.getEstado().name() : null,
                obra.getTipo() != null ? obra.getTipo().getNombre() : null,
                obra.getDemografia() != null ? obra.getDemografia().getNombre() : null,
                obra.getGrupo() != null ? obra.getGrupo().getId() : null,
                obra.getGrupo() != null ? obra.getGrupo().getNombre() : null,
                obra.getGeneros() != null ? obra.getGeneros().stream().map(Genero::getNombre).collect(Collectors.toList()) : null,
                obra.getStaff() != null ? obra.getStaff().stream().map(Miembro::getId).collect(Collectors.toList()) : null,
                obra.getStaff() != null ? obra.getStaff().stream().map(Miembro::getNombre).collect(Collectors.toList()) : null
        );
    }
}
