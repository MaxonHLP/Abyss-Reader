package com.abyssreader.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "capitulo_leido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapituloLeido {

    @EmbeddedId
    private CapituloLeidoId id;

    @Column(name = "fecha_lectura")
    private LocalDateTime leidoEn = LocalDateTime.now();

    public CapituloLeido(CapituloLeidoId id) {
        this.id = id;
    }
}
