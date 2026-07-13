package com.abyssreader.api.entity;

import com.abyssreader.api.util.Rol;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED) // Preparado para Lector y Miembro
@SQLDelete(sql = "UPDATE usuarios SET activo = false WHERE id = ?")
@SQLRestriction("activo = true")
@Getter
@Setter
@NoArgsConstructor
public class Usuario extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String mail;

    @Column(nullable = false)
    private String contrasena;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Rol rol;

    @Column(name = "foto_perfil")
    private String fotoPerfil;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private Boolean esDemo = false;

    /**
     * Fecha/hora de expiración para cuentas demo efímeras.
     * NULL = usuario permanente (no demo con TTL).
     * Cuando no es NULL, el DemoCleanupTask eliminará el usuario pasada esta fecha.
     */
    @Column(name = "expiracion_demo")
    private LocalDateTime expiracionDemo;

    /**
     * Token de reinicio hasheado para el flujo de token dual.
     * Permite que el frontend reutilice una sesión demo previa sin crear una cuenta nueva.
     * Se almacena como hash SHA-256 para no exponer el JWT real en la BD.
     */
    @Column(name = "reinit_token", length = 64)
    private String reinitToken;

    // =========================================================================
    // Contadores de entidades creadas por usuarios demo
    // =========================================================================

    /**
     * Cantidad de grupos creados. Solo es relevante para usuarios demo MASTER.
     * Límite demo: 2. Se incrementa atómicamente al crear un grupo.
     */
    @Column(nullable = false)
    private Integer gruposCreados = 0;

    /**
     * Cantidad de obras creadas. Para MASTER y MIEMBRO_ADMIN demo.
     * Límite demo: 3. Se incrementa atómicamente al confirmar una obra.
     */
    @Column(nullable = false)
    private Integer obrasCreadas = 0;

    /**
     * Cantidad de capítulos creados. Para MASTER y MIEMBRO_ADMIN demo.
     * Límite demo: 15. Se incrementa atómicamente al confirmar un capítulo.
     */
    @Column(nullable = false)
    private Integer capitulosCreados = 0;
}
