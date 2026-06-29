package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "historial",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "obra_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Historial extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    /**
     * Capítulo más reciente leído por el usuario en esta obra.
     * Se actualiza en cada llamada al endpoint de tracking (upsert).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "capitulo_id", nullable = false)
    private Capitulo capitulo;
}
