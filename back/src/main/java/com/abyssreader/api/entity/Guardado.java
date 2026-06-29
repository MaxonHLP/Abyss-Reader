package com.abyssreader.api.entity;

import com.abyssreader.api.util.EstadoGuardado;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "guardados",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "obra_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Guardado extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoGuardado estado;
}
