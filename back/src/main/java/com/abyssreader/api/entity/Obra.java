package com.abyssreader.api.entity;

import com.abyssreader.api.util.EstadoObra;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "obras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Obra extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    @Column
    private String portada;

    @Column(nullable = false)
    private Integer vistas = 0;

    @Column(nullable = false)
    private Integer likes = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoObra estado = EstadoObra.EN_EMISION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_id")
    private Tipo tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demografia_id")
    private Demografia demografia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "obra_genero",
            joinColumns = @JoinColumn(name = "obra_id"),
            inverseJoinColumns = @JoinColumn(name = "genero_id")
    )
    private Set<Genero> generos = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "obra_staff",
            joinColumns = @JoinColumn(name = "obra_id"),
            inverseJoinColumns = @JoinColumn(name = "miembro_id")
    )
    private Set<Miembro> staff = new HashSet<>();

    /**
     * Relación bidireccional con Capitulo.
     * CascadeType.REMOVE + orphanRemoval garantizan que al borrar
     * la Obra, Hibernate elimine todos sus capítulos (y sus páginas
     * por @ElementCollection) sin intervención manual.
     */
    @OneToMany(mappedBy = "obra", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Capitulo> capitulos = new ArrayList<>();

    @Column(nullable = false)
    private Boolean dataCore = false;

    /**
     * ID del usuario que creó esta obra.
     * NULL = obra creada previamente al sistema demo o datos de exhibición.
     * Usado para aislamiento de entorno demo.
     */
    @Column(name = "creador_id")
    private Long creadorId;
}

