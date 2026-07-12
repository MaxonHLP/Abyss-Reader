package com.abyssreader.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "capitulos", uniqueConstraints = {@UniqueConstraint(columnNames = {"obra_id", "numero"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Capitulo extends BaseEntity {

    @Column(nullable = false)
    private double numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "obra_id", nullable = false)
    private Obra obra;

    /**
     * Lista ordenada de URLs de páginas almacenadas en Google Cloud Storage.
     * Cada URL es un String que apunta directamente a la imagen pública.
     * La columna "orden_pagina" garantiza que el orden de inserción se preserve.
     */
    @ElementCollection
    @CollectionTable(
            name = "capitulo_paginas",
            joinColumns = @JoinColumn(name = "capitulo_id")
    )
    @OrderColumn(name = "orden_pagina")
    @Column(name = "url", nullable = false, length = 1024)
    private List<String> paginasUrls = new ArrayList<>();

    @Column(nullable = false)
    private Boolean dataCore = false;
}
