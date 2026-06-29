package com.abyssreader.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CapituloLeidoId implements Serializable {

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "capitulo_id")
    private Long capituloId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CapituloLeidoId that = (CapituloLeidoId) o;
        return Objects.equals(usuarioId, that.usuarioId) &&
               Objects.equals(capituloId, that.capituloId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(usuarioId, capituloId);
    }
}
