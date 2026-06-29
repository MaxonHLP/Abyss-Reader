package com.abyssreader.api.service;

import com.abyssreader.api.dto.guardado.GuardadoRequestDTO;
import com.abyssreader.api.dto.guardado.GuardadoResponseDTO;
import com.abyssreader.api.entity.Guardado;
import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.GuardadoRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GuardadoService {

    private final GuardadoRepository guardadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObraRepository obraRepository;

    /**
     * Upsert de Guardado: si ya existe un registro (usuario, obra), actualiza el estado.
     * Si no existe, crea uno nuevo. Garantizado por la constraint de unicidad en BD.
     *
     * @param mail  Email del usuario autenticado (extraído del JWT en el Controller).
     * @param dto   Datos de entrada sin usuarioId (Zero-Trust).
     * @return      GuardadoResponseDTO con datos aplanados.
     */
    @Transactional
    public GuardadoResponseDTO upsertGuardado(String mail, GuardadoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByMail(mail)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + mail));

        // getReferenceById evita un SELECT previo; la FK se valida en el flush
        Obra obra = obraRepository.getReferenceById(dto.getObraId());

        Guardado guardado = guardadoRepository
                .findByUsuarioMailAndObraId(mail, dto.getObraId())
                .orElseGet(() -> {
                    Guardado nuevo = new Guardado();
                    nuevo.setUsuario(usuario);
                    nuevo.setObra(obra);
                    return nuevo;
                });

        guardado.setEstado(dto.getEstado());
        Guardado guardadoGuardado = guardadoRepository.save(guardado);

        return mapToDTO(guardadoGuardado);
    }

    /**
     * Lista todos los guardados del usuario autenticado, ordenados por fecha de actualización.
     *
     * @param mail  Email del usuario autenticado.
     * @return      Lista de GuardadoResponseDTO.
     */
    @Transactional(readOnly = true)
    public List<GuardadoResponseDTO> listarGuardados(String mail) {
        return guardadoRepository.findAllByUsuarioMailOrderByUpdatedAtDesc(mail)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * Elimina el guardado del usuario para una obra específica (deseleccionar).
     *
     * @param mail   Email del usuario autenticado.
     * @param obraId ID de la obra a desmarcar.
     */
    @Transactional
    public void eliminarGuardado(String mail, Long obraId) {
        guardadoRepository.deleteByUsuarioMailAndObraId(mail, obraId);
    }

    private GuardadoResponseDTO mapToDTO(Guardado guardado) {
        return new GuardadoResponseDTO(
                guardado.getId(),
                guardado.getEstado(),
                guardado.getObra().getId(),
                guardado.getObra().getTitulo(),
                guardado.getObra().getPortada()
        );
    }
}
