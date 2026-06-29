package com.abyssreader.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lectores")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
@NoArgsConstructor
public class Lector extends Usuario {

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    // TODO: Agregar relaciones como el historial de lectura (Vistos) y Guardados
    // más adelante
}
