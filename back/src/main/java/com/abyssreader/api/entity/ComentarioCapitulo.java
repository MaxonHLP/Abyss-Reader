package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Entidad de comentarios de un Capítulo, con soporte para hilos anidados (self-referencing).
 * Hereda id, createdAt y updatedAt de BaseEntity.
 *
 * LAZY en la relación con Capitulo para evitar el problema N+1 al cargar
 * una Obra con sus capítulos — nunca se arrastrará la lista de comentarios
 * automáticamente.
 *
 * SOFT DELETE MANUAL: No usa @SQLDelete ni @SQLRestriction.
 * El campo 'eliminado=true' señala que el contenido fue borrado,
 * pero la fila se conserva para mantener el árbol de respuestas intacto.
 */
@Entity
@Table(name = "comentarios_capitulo")
@Getter
@Setter
@NoArgsConstructor
public class ComentarioCapitulo extends BaseEntity {

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
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    /**
     * Capítulo al que pertenece el comentario.
     * LAZY: nunca se carga automáticamente al consultar capítulos desde Obra.
     * Esto evita completamente el problema N+1.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capitulo_id", nullable = false)
    private Capitulo capitulo;

    // ─── Relación recursiva padre-hijo ────────────────────────────────────────

    /**
     * Referencia al comentario padre. NULL indica comentario de nivel raíz.
     * LAZY para evitar carga en cascada no deseada hacia arriba del árbol.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    private ComentarioCapitulo padre;

    /**
     * Lista de respuestas directas a este comentario.
     * CascadeType.ALL + orphanRemoval garantizan que al borrar un comentario
     * físicamente, sus hijos también sean eliminados.
     * NOTA: Esto solo aplica en hard-delete; el soft-delete no llama remove().
     */
    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ComentarioCapitulo> respuestas = new ArrayList<>();
}
