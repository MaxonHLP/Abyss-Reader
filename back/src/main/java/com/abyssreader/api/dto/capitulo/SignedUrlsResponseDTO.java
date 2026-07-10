package com.abyssreader.api.dto.capitulo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Respuesta de la Fase 1 del flujo de subida con Signed URLs.
 * Contiene una lista de pares (URL firmada para PUT + URL pública final).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignedUrlsResponseDTO {

    private List<SignedUrlItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignedUrlItem {

        /**
         * URL temporal firmada a la que el frontend debe hacer PUT con el archivo binario.
         * Válida por 15 minutos. El Content-Type del PUT debe coincidir exactamente con
         * el tipo enviado en la solicitud.
         */
        private String uploadUrl;

        /**
         * URL pública permanente del archivo una vez subido.
         * El frontend la devuelve en la Fase 2 (confirmación) para que el backend la persista.
         */
        private String publicUrl;
    }
}
