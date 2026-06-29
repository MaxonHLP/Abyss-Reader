package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "vista_tracking",
    indexes = {
        @Index(name = "idx_vista_usuario", columnList = "usuarioId"),
        @Index(name = "idx_vista_capitulo", columnList = "capituloId")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class VistaTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private Long capituloId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
