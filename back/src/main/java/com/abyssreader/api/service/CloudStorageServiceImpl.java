package com.abyssreader.api.service;

import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Implementación de StorageService sobre Google Cloud Storage.
 *
 * Si el bucket tiene "Uniform Bucket-Level Access" activo (recomendado por Google),
 * las ACL por objeto no están disponibles. En ese caso se omite predefinedAcl y
 * la visibilidad pública se gestiona a nivel IAM en la consola de GCP
 * (bucket → Permissions → Add principal: allUsers → Storage Object Viewer).
 *
 * Si el bucket NO tiene acceso uniforme, se puede descomentar la opción de ACL.
 */
@Service
@RequiredArgsConstructor
public class CloudStorageServiceImpl implements StorageService {

    private final Storage storage;

    @Value("${gcs.bucket-name}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file, String folderPath) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                if (auth.getName().endsWith("@demo.com")) {
                    folderPath = "demo-uploads/" + folderPath;
                }
            }

            String originalFilename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename()
                    : "pagina";
            String objectName = folderPath + UUID.randomUUID() + "_" + originalFilename;

            BlobId blobId = BlobId.of(bucketName, objectName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            /*
             * Subida usando storage.create() con los bytes del archivo.
             *
             * OPCIÓN A — Bucket con Uniform Bucket-Level Access (IAM gestiona acceso público):
             *   No se pasa ninguna BlobTargetOption de ACL.
             *   Configurar en GCP Console: bucket → Permissions → allUsers → Storage Object Viewer
             *
             * OPCIÓN B — Bucket sin acceso uniforme (ACL por objeto):
             *   Descomentar la línea de predefinedAcl abajo.
             */
            storage.create(
                    blobInfo,
                    file.getBytes()
                    // , Storage.BlobTargetOption.predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ)
                    // ↑ Descomentar solo si el bucket NO tiene Uniform Bucket-Level Access
            );

            // URL pública estándar de Google Cloud Storage
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, objectName);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Error al subir el archivo a Google Cloud Storage: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        // Extrae el blobName quitando el prefijo de URL pública de GCS
        String prefix = String.format("https://storage.googleapis.com/%s/", bucketName);
        if (!fileUrl.startsWith(prefix)) {
            throw new IllegalArgumentException(
                    "La URL no pertenece al bucket configurado: " + fileUrl);
        }
        String blobName = fileUrl.substring(prefix.length());
        BlobId blobId = BlobId.of(bucketName, blobName);
        storage.delete(blobId);
    }
}
