package com.abyssreader.api.service;

import com.abyssreader.api.entity.Obra;
import com.abyssreader.api.entity.ObraLike;
import com.abyssreader.api.entity.Usuario;
import com.abyssreader.api.repository.ObraLikeRepository;
import com.abyssreader.api.repository.ObraRepository;
import com.abyssreader.api.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Servicio para gestionar Likes y Vistas de Obras.
 *
 * - Likes: Tabla intermedia obra_usuario_like con toggle (dar/quitar).
 *          Actualiza el contador en Obra con query atómica para evitar race conditions.
 * - Vistas: Incremento atómico del contador en Obra, disparado al registrar un progreso
 *           de lectura (llamado desde HistorialService).
 */
@Service
@RequiredArgsConstructor
public class ObraInteraccionService {

    private final ObraRepository obraRepository;
    private final ObraLikeRepository obraLikeRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Toggle de like: si ya existe lo elimina (unlike), si no existe lo crea (like).
     * Zero-Trust: el mail del usuario viene del token JWT, nunca del cliente.
     *
     * @return Map con { "liked": true/false, "likes": totalActual }
     */
    @Transactional
    public Map<String, Object> toggleLike(Long obraId, String mailUsuario) {
        Obra obra = obraRepository.findById(obraId)
                .orElseThrow(() -> new EntityNotFoundException("Obra no encontrada con id: " + obraId));

        Usuario usuario = usuarioRepository.findByMail(mailUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + mailUsuario));

        boolean yaLikeado = obraLikeRepository.existsByObraIdAndUsuarioId(obraId, usuario.getId());

        if (yaLikeado) {
            // Unlike: borrar registro y decrementar contador
            obraLikeRepository.deleteByObraIdAndUsuarioId(obraId, usuario.getId());
            obraRepository.decrementarLikes(obraId);
            // Refrescar el valor real de likes desde la BD
            int likesActuales = obraRepository.findById(obraId).map(Obra::getLikes).orElse(0);
            return Map.of("liked", false, "likes", likesActuales);
        } else {
            // Like: crear registro e incrementar contador
            ObraLike nuevoLike = new ObraLike();
            nuevoLike.setObra(obra);
            nuevoLike.setUsuario(usuario);
            obraLikeRepository.save(nuevoLike);
            obraRepository.incrementarLikes(obraId);
            int likesActuales = obraRepository.findById(obraId).map(Obra::getLikes).orElse(0);
            return Map.of("liked", true, "likes", likesActuales);
        }
    }

    /**
     * Verifica si el usuario ya dio like a una obra.
     */
    @Transactional(readOnly = true)
    public boolean tienelike(Long obraId, String mailUsuario) {
        Usuario usuario = usuarioRepository.findByMail(mailUsuario)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + mailUsuario));
        return obraLikeRepository.existsByObraIdAndUsuarioId(obraId, usuario.getId());
    }

    /**
     * Incrementa el contador de vistas de una obra de forma atómica.
     * Llamado internamente cuando un usuario registra progreso de lectura.
     */
    @Transactional
    public void incrementarVistas(Long obraId) {
        if (!obraRepository.existsById(obraId)) return;
        obraRepository.incrementarVistas(obraId);
    }
}
