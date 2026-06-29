package com.abyssreader.api.service;

import com.abyssreader.api.dto.historial.HistorialRequestDTO;
import com.abyssreader.api.dto.historial.HistorialResponseDTO;
import com.abyssreader.api.entity.Capitulo;
import com.abyssreader.api.entity.Historial;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.entity.VistaTracking;
import com.abyssreader.api.repository.CapituloRepository;
import com.abyssreader.api.repository.HistorialRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import com.abyssreader.api.repository.VistaTrackingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialService {

    private final HistorialRepository historialRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObraRepository obraRepository;
    private final CapituloRepository capituloRepository;
    private final VistaTrackingRepository vistaTrackingRepository;

    /**
     * Upsert de Historial: si ya existe un registro (usuario, obra), actualiza el capítulo
     * y la fecha (updatedAt se gestiona automáticamente por @UpdateTimestamp en BaseEntity).
     * Si no existe, crea un nuevo registro.
     *
     * @param mail  Email del usuario autenticado (extraído del JWT en el Controller).
     * @param dto   Datos de entrada sin usuarioId (Zero-Trust).
     * @return      HistorialResponseDTO con datos aplanados.
     */
    @Transactional
    public HistorialResponseDTO registrarProgreso(String mail, HistorialRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByMail(mail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + mail));

        // getReferenceById para Obra y Capitulo: evita SELECTs previos innecesarios
        Obra obra = obraRepository.getReferenceById(dto.getObraId());
        Capitulo capitulo = capituloRepository.getReferenceById(dto.getCapituloId());

        Historial historial = historialRepository
                .findByUsuarioMailAndObraId(mail, dto.getObraId())
                .orElse(new Historial());

        if (historial.getId() == null) {
            historial.setUsuario(usuario);
            historial.setObra(obra);
        }

        // Lógica de Vistas (Tabla Volátil con TTL de 24 hs)
        java.time.LocalDateTime limite = java.time.LocalDateTime.now().minusHours(24);
        boolean vistoRecientemente = vistaTrackingRepository.existsByUsuarioIdAndCapituloIdAndFechaCreacionAfter(
                usuario.getId(),
                dto.getCapituloId(),
                limite
        );

        if (!vistoRecientemente) {
            VistaTracking vista = new VistaTracking();
            vista.setUsuarioId(usuario.getId());
            vista.setCapituloId(dto.getCapituloId());
            vistaTrackingRepository.save(vista);

            obraRepository.incrementarVistas(dto.getObraId());
        }

        // Actualizar capítulo (en upsert, esto actualiza el campo y fuerza updatedAt)
        historial.setCapitulo(capitulo);
        Historial historialGuardado = historialRepository.save(historial);

        return mapToDTO(historialGuardado);
    }

    /**
     * Lista todo el historial del usuario autenticado, ordenado por fecha de
     * última actualización descendente (capítulo leído más recientemente primero).
     *
     * @param mail  Email del usuario autenticado.
     * @return      Lista de HistorialResponseDTO.
     */
    @Transactional(readOnly = true)
    public List<HistorialResponseDTO> listarHistorial(String mail) {
        return historialRepository.findAllByUsuarioMailOrderByUpdatedAtDesc(mail)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private HistorialResponseDTO mapToDTO(Historial historial) {
        return new HistorialResponseDTO(
                historial.getId(),
                historial.getObra().getId(),
                historial.getObra().getTitulo(),
                historial.getObra().getPortada(),
                historial.getCapitulo().getId(),
                historial.getCapitulo().getNumero(),
                historial.getUpdatedAt()
        );
    }
}
