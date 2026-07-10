package com.abyssreader.api.dto.capitulo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Representa un archivo que el frontend quiere subir directamente a GCS.
 * El backend usa estos datos para generar una URL firmada específica para ese archivo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignedUrlRequestItem {

    /** Nombre original del archivo (ej: "pag1.jpg"). Se usa solo para conservar la extensión. */
    @NotBlank(message = "El nombre del archivo es obligatorio")
    private String nombre;

    /** MIME type del archivo (ej: "image/jpeg"). Debe coincidir exactamente con el Content-Type del PUT. */
    @NotBlank(message = "El tipo del archivo es obligatorio")
    private String tipo;
}
