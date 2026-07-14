package com.abyssreader.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grupos")
@Getter
@Setter
@NoArgsConstructor
public class Grupo extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "portada")
    private String portada;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "grupo", fetch = FetchType.LAZY)
    private List<Miembro> miembros = new ArrayList<>();

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Obra> obras = new ArrayList<>();

    @Column(nullable = false)
    private Boolean activo = true;

    /**
     * ID del usuario (MASTER) que creó este grupo.
     * NULL = grupo creado por el sistema (previo al sistema demo) o datos de exhibición.
     * Usado para el aislamiento de entorno: un MASTER demo solo puede gestionar
     * los grupos donde creadorId == su propio id.
     */
    @Column(name = "creador_id")
    private Long creadorId;

    /**
     * Marca este grupo como contenido de exhibición del sistema.
     * Los usuarios demo no pueden modificar ni eliminar grupos con dataCore=true,
     * recibiendo el toast "Contenido de Exhibición" en su lugar.
     */
    @Column(nullable = false)
    private Boolean dataCore = false;
}

