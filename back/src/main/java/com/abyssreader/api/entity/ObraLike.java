package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tabla intermedia que registra el like de un usuario a una obra.
 * Un usuario solo puede dar un like por obra (unique constraint).
 */
@Entity
@Table(
    name = "obra_usuario_like",
    uniqueConstraints = @UniqueConstraint(columnNames = {"obra_id", "usuario_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class ObraLike extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
