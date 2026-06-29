package com.abyssreader.api.service;

import com.abyssreader.api.dto.capitulo.CapituloListItemDTO;
import com.abyssreader.api.dto.capitulo.CapituloResponseDTO;
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
import org.springframework.web.multipart.MultipartFile;
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
     * Crea un nuevo capítulo para una obra, subiendo todas las páginas a GCS en orden.
     * Se recupera la Obra por proxy (getReferenceById) para evitar un SELECT innecesario.
     */
    @Transactional
    public CapituloResponseDTO crearCapitulo(Long obraId, double numero, List<MultipartFile> paginas) {
        // Proxy de Obra: no hace SELECT hasta que se accede a un campo; el INSERT validará la FK
        Obra obra = obraRepository.getReferenceById(obraId);

        Capitulo capitulo = new Capitulo();
        capitulo.setObra(obra);
        capitulo.setNumero(numero);

        // Subida secuencial de páginas para preservar el orden
        String folderPath = String.format("obras/%d/capitulos/%.0f/", obraId, numero);
        List<String> urls = new ArrayList<>();
        for (MultipartFile pagina : paginas) {
            String url = storageService.uploadFile(pagina, folderPath);
            urls.add(url);
        }
        capitulo.setPaginasUrls(urls);

        Capitulo guardado = capituloRepository.save(capitulo);
        return mapToDTO(guardado);
    }

    /**
     * Obtiene un capítulo por el nombre de la obra y número.
     * Calcula los IDs de navegación (anterior/siguiente) y los incluye en el DTO.
     */
    @Transactional(readOnly = true)
    public CapituloResponseDTO obtenerCapituloPorObraYNumero(String nombreObra, double numero) {
        Capitulo capitulo = capituloRepository
                .findByObraTituloAndNumero(nombreObra, numero)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("Capítulo %.0f de la obra '%s' no encontrado", numero, nombreObra)
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
     * Edita un capítulo existente usando la estrategia de Payload Mixto + Hard Delete.
     *
     * <p>El cliente envía:
     * <ul>
     *   <li>{@code ordenFinal} – lista ordenada donde cada elemento es una URL existente
     *       (que se conserva) o el token literal {@code "NUEVO"} (página nueva a subir).</li>
     *   <li>{@code archivosNuevos} – archivos correspondientes a los tokens NUEVO, en el
     *       mismo orden en que aparecen en {@code ordenFinal}.</li>
     * </ul>
     *
     * <p>Pasos:
     * <ol>
     *   <li><b>Hard Delete</b>: borra de GCS toda URL actual que no esté en {@code ordenFinal}.</li>
     *   <li><b>Ensamblaje</b>: recorre {@code ordenFinal} y reemplaza cada token NUEVO
     *       por la URL del archivo recién subido.</li>
     *   <li><b>Persistencia</b>: limpia {@code paginasUrls} y las reemplaza en bloque.</li>
     * </ol>
     *
     * @param id             ID del capítulo a editar
     * @param ordenFinal     lista ordenada de URLs existentes y tokens "NUEVO"
     * @param archivosNuevos archivos a subir para cada token "NUEVO" (puede ser null si no hay nuevos)
     * @return DTO actualizado del capítulo
     */
    @Transactional
    public CapituloResponseDTO editarCapitulo(Long id,
                                              List<String> ordenFinal,
                                              List<MultipartFile> archivosNuevos) {

        // Recuperar capítulo o lanzar 404
        Capitulo capitulo = capituloRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Capítulo con ID " + id + " no encontrado"));

        // Paso 1 – Hard Delete: eliminar de GCS las páginas que el cliente descartó
        List<String> urlsActuales = capitulo.getPaginasUrls();
        for (String urlAntigua : urlsActuales) {
            if (!ordenFinal.contains(urlAntigua)) {
                storageService.deleteFile(urlAntigua);
            }
        }

        // Paso 2 & 3 – Ensamblaje: construir la nueva lista respetando el orden indicado
        List<String> nuevasUrls = new ArrayList<>();
        int indexNuevo = 0;
        String folderPath = String.format("obras/%d/capitulos/%.0f/",
                capitulo.getObra().getId(), capitulo.getNumero());

        for (String token : ordenFinal) {
            if (token.contains("http")) {
                // URL existente conservada → se agrega directamente
                nuevasUrls.add(token);
            } else if ("NUEVO".equals(token)) {
                // Página nueva → subir y obtener URL
                MultipartFile archivo = archivosNuevos.get(indexNuevo);
                String nuevaUrl = storageService.uploadFile(archivo, folderPath);
                nuevasUrls.add(nuevaUrl);
                indexNuevo++;
            }
        }

        // Paso 4 – Persistencia: reemplazar la colección en la entidad ya gestionada
        capitulo.getPaginasUrls().clear();
        capitulo.getPaginasUrls().addAll(nuevasUrls);
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
