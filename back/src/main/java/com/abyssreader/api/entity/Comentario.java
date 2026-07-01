package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de comentarios con soporte para hilos anidados (self-referencing).
 * Hereda id, createdAt y updatedAt de BaseEntity.
 *
 * SOFT DELETE MANUAL: No usa @SQLDelete ni @SQLRestriction.
 * El campo 'eliminado=true' señala que el contenido fue borrado,
 * pero la fila se conserva para mantener el árbol de respuestas intacto.
 */
@Entity
@Table(name = "comentarios")
@Getter
@Setter
@NoArgsConstructor
public class Comentario extends BaseEntity {

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    /**
     * Soft-delete flag. Cuando es true, el contenido se reemplaza por
     * "[Comentario eliminado]" pero la fila vive para sostener las respuestas.
     */
    @Column(nullable = false)
    private boolean eliminado = false;

    // ─── Relaciones externas ─────────────────────────────────────────────────

    /**
     * Autor del comentario. LAZY para no cargar el usuario en cada query de lista.
     * Si el usuario es eliminado (soft-delete de Usuario), la FK sigue existiendo
     * pero la @SQLRestriction del Usuario filtrará su visibilidad — aceptable para MVP.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    /**
     * Obra a la que pertenece el comentario.
     * Sin CascadeType aquí; la eliminación en cascada se gestiona en Obra.java
     * con CascadeType.REMOVE en la colección de comentarios (no incluida para evitar
     * ciclos de carga), pero la FK tiene ON DELETE CASCADE implícito en la BD.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    // ─── Relación recursiva padre-hijo ────────────────────────────────────────

    /**
     * Referencia al comentario padre. NULL indica comentario de nivel raíz.
     * LAZY para evitar carga en cascada no deseada hacia arriba del árbol.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    private Comentario padre;

    /**
     * Lista de respuestas directas a este comentario.
     * CascadeType.ALL + orphanRemoval garantizan que al borrar un comentario
     * físicamente, sus hijos también sean eliminados.
     * NOTA: Esto solo aplica en hard-delete; el soft-delete no llama remove().
     */
    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<Comentario> respuestas = new ArrayList<>();
}
