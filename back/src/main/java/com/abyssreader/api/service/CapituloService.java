package com.abyssreader.api.service;

import com.abyssreader.api.dto.capitulo.CapituloListItemDTO;
import com.abyssreader.api.dto.capitulo.CapituloResponseDTO;
import com.abyssreader.api.dto.capitulo.ConfirmarCapituloRequestDTO;
import com.abyssreader.api.dto.capitulo.EditarCapituloRequestDTO;
import com.abyssreader.api.dto.capitulo.SignedUrlRequestItem;
import com.abyssreader.api.dto.capitulo.SignedUrlsResponseDTO;
import com.abyssreader.api.entity.Capitulo;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.repository.CapituloRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.HistorialRepository;
import com.abyssreader.api.repository.VistaTrackingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.abyssreader.api.repository.CapituloLeidoRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.entity.CapituloLeido;
import com.abyssreader.api.entity.CapituloLeidoId;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CapituloService {

    private final CapituloRepository capituloRepository;
    private final ObraRepository obraRepository;
    private final StorageService storageService;
    private final HistorialRepository historialRepository;
    private final VistaTrackingRepository vistaTrackingRepository;
    private final CapituloLeidoRepository capituloLeidoRepository;
    private final UsuarioRepository usuarioRepository;



    /**
     * Fase 1 del flujo de Signed URLs: genera URLs firmadas temporales (15 min) para que
     * el frontend suba las imágenes directamente a GCS sin pasar por este servidor.
     *
     * @param obraId    ID de la obra a la que pertenece el capítulo
     * @param numero    número del capítulo (para validación de duplicado y ruta en bucket)
     * @param archivos  lista de descriptores de archivo ({nombre, tipo}) enviados por el frontend
     * @param esEdicion indica si se está pidiendo firmas para editar un capítulo existente
     * @return DTO con lista de pares (uploadUrl firmada, publicUrl final)
     */
    public SignedUrlsResponseDTO generarUrlsFirmadas(Long obraId, double numero, List<SignedUrlRequestItem> archivos, boolean esEdicion) {
        if (!esEdicion && capituloRepository.existsByObraIdAndNumero(obraId, numero)) {
            throw new IllegalArgumentException("Ya existe el capítulo " + numero + " para esta obra.");
        }
        String folderPath = String.format("obras/%d/capitulos/%.0f/", obraId, numero);
        return storageService.generarUrlsFirmadas(archivos, folderPath);
    }

    /**
     * Fase 2 del flujo de Signed URLs: el frontend ya subió las imágenes a GCS y notifica
     * al backend con las URLs públicas para persistir el capítulo en la base de datos.
     *
     * @param obraId  ID de la obra
     * @param request DTO con número de capítulo y lista ordenada de URLs públicas de GCS
     * @return DTO completo del capítulo recién creado
     */
    @Transactional
    public CapituloResponseDTO confirmarCapitulo(Long obraId, ConfirmarCapituloRequestDTO request) {
        double numero = request.getNumero();
        if (capituloRepository.existsByObraIdAndNumero(obraId, numero)) {
            throw new IllegalArgumentException("Ya existe el capítulo " + numero + " para esta obra.");
        }
        Obra obra = obraRepository.getReferenceById(obraId);
        Capitulo capitulo = new Capitulo();
        capitulo.setObra(obra);
        capitulo.setNumero(numero);
        capitulo.setPaginasUrls(request.getPaginasUrls());
        Capitulo guardado = capituloRepository.save(capitulo);
        return mapToDTO(guardado);
    }

    /**
     * Obtiene un capítulo por el nombre de la obra y número.
     * Calcula los IDs de navegación (anterior/siguiente) y los incluye en el DTO.
     */
    @Transactional(readOnly = true)
    public CapituloResponseDTO obtenerCapituloPorObraYNumero(String nombreObra, double numero) {
        String tituloNorm = nombreObra.replace("-", " ");
        Capitulo capitulo = capituloRepository
                .findByObraTituloAndNumero(tituloNorm, numero)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Capítulo %.0f de la obra '%s' no encontrado", numero, tituloNorm)
                ));

        return mapToDTO(capitulo);
    }

    /**
     * Lista todos los capítulos de una obra ordenados por número ascendente.
     * Usado por la página de detalle de obra para mostrar la lista de capítulos.
     */
    @Transactional(readOnly = true)
    public List<CapituloListItemDTO> listarCapitulosPorObra(Long obraId) {
        List<Capitulo> capitulos = capituloRepository.findByObraIdOrderByNumeroAsc(obraId);
        
        List<Long> leidosIds = new ArrayList<>();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            usuarioRepository.findByMail(auth.getName()).ifPresent(usuario -> {
                List<Long> capituloIds = capitulos.stream().map(Capitulo::getId).toList();
                if (!capituloIds.isEmpty()) {
                    leidosIds.addAll(capituloLeidoRepository.findLeidosByUsuarioAndCapitulos(usuario.getId(), capituloIds));
                }
            });
        }

        return capitulos.stream()
                .map(c -> new CapituloListItemDTO(c.getId(), c.getNumero(), c.getCreatedAt(), leidosIds.contains(c.getId())))
                .toList();
    }

    /**
     * Edita un capítulo existente. Recibe la lista final y ordenada de URLs públicas
     * de GCS — el frontend ya subió las imágenes nuevas directamente al bucket antes
     * de llamar a este endpoint (flujo Signed URLs).
     *
     * <p>Las URLs que ya no están en la lista nueva son borradas de GCS (Hard Delete).
     * Luego se reemplaza la colección {@code paginasUrls} del capítulo en bloque.
     *
     * @param id  ID del capítulo a editar
     * @param dto DTO con el nuevo número (opcional) y la lista ordenada de URLs finales
     * @return DTO actualizado del capítulo
     */
    @Transactional
    public CapituloResponseDTO editarCapitulo(Long id, EditarCapituloRequestDTO dto) {

        // 1. Recuperar capítulo o lanzar 404
        Capitulo capitulo = capituloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Capítulo con ID " + id + " no encontrado"));

        // 2. Actualizar número si viene en el DTO
        if (dto.getNumero() != null) {
            capitulo.setNumero(dto.getNumero());
        }

        // 3. Hard Delete: borrar de GCS las páginas que el cliente descartó
        List<String> urlsNuevas = dto.getPaginasUrls();
        for (String urlAntigua : capitulo.getPaginasUrls()) {
            if (!urlsNuevas.contains(urlAntigua)) {
                try {
                    storageService.deleteFile(urlAntigua);
                } catch (Exception e) {
                    // Loguear pero no abortar la transacción: el archivo puede no existir
                    System.err.println("[GCS] No se pudo borrar página descartada: "
                            + urlAntigua + " - " + e.getMessage());
                }
            }
        }

        // 4. Reemplazar la colección en la entidad ya gestionada por JPA
        //    @ElementCollection se borra y re-inserta en bloque al hacer clear() + addAll()
        //    dentro de la misma transacción, respetando @OrderColumn
        capitulo.getPaginasUrls().clear();
        capitulo.getPaginasUrls().addAll(urlsNuevas);

        Capitulo guardado = capituloRepository.save(capitulo);
        return mapToDTO(guardado);
    }

    /**
     * Elimina un capítulo definitivamente (hard delete).
     * El orden del algoritmo es innegociable:
     * 1. Borrar todas las páginas de GCS.
     * 2. Borrar el registro de la base de datos.
     */
    @Transactional
    public void eliminarCapitulo(Long id) {
        Capitulo capitulo = capituloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Capítulo con ID " + id + " no encontrado"));

        // Paso 1 — Purgar GCS
        for (String url : capitulo.getPaginasUrls()) {
            try {
                storageService.deleteFile(url);
            } catch (Exception e) {
                System.err.println("No se pudo eliminar página de GCS: " + url + " - " + e.getMessage());
            }
        }

        // Paso 2 — Eliminar referencias en Historial, VistaTracking y CapituloLeido
        historialRepository.deleteAllByCapituloId(id);
        vistaTrackingRepository.deleteAllByCapituloId(id);
        capituloLeidoRepository.deleteAllByIdCapituloId(id);

        // Paso 3 — Borrar registro
        capituloRepository.delete(capitulo);
    }


    private CapituloResponseDTO mapToDTO(Capitulo capitulo) {
        Long obraId = capitulo.getObra().getId();
        double numero = capitulo.getNumero();

        // Recuperar captulo anterior y siguiente una sola vez para evitar queries duplicadas
        var anterior = capituloRepository
                .findFirstByObraIdAndNumeroLessThanOrderByNumeroDesc(obraId, numero);
        var siguiente = capituloRepository
                .findFirstByObraIdAndNumeroGreaterThanOrderByNumeroAsc(obraId, numero);

        boolean leido = false;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            java.util.Optional<com.abyssreader.api.entity.Usuario> userOpt = usuarioRepository.findByMail(auth.getName());
            if (userOpt.isPresent()) {
                leido = capituloLeidoRepository.findByIdUsuarioIdAndIdCapituloId(userOpt.get().getId(), capitulo.getId()).isPresent();
            }
        }

        return new CapituloResponseDTO(
                capitulo.getId(),
                capitulo.getNumero(),
                obraId,
                capitulo.getCreatedAt(),
                capitulo.getUpdatedAt(),
                leido,
                capitulo.getPaginasUrls(),
                anterior.map(Capitulo::getId).orElse(null),
                siguiente.map(Capitulo::getId).orElse(null),
                anterior.map(Capitulo::getNumero).orElse(null),
                siguiente.map(Capitulo::getNumero).orElse(null)
        );
    }

    /**
     * Marca un capítulo como leído para el usuario autenticado (Upsert silencioso).
     */
    @Transactional
    public void marcarComoLeido(Long capituloId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return; // Upsert silencioso: si no está logueado, no hace nada
        }
        
        usuarioRepository.findByMail(auth.getName()).ifPresent(usuario -> {
            CapituloLeidoId id = new CapituloLeidoId(usuario.getId(), capituloId);
            if (!capituloLeidoRepository.existsById(id)) {
                CapituloLeido leido = new CapituloLeido();
                leido.setId(id);
                capituloLeidoRepository.save(leido);
            }
        });
    }
}
