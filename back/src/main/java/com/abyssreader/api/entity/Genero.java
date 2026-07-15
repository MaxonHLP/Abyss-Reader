package com.abyssreader.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "generos")
@SQLDelete(sql = "UPDATE generos SET activo = false WHERE id = ?")
@SQLRestriction("activo = true")
@org.hibernate.annotations.BatchSize(size = 20)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Genero extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;
}
