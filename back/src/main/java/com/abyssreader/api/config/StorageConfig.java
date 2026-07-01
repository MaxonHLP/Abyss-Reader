package com.abyssreader.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Configuración del cliente de Google Cloud Storage.
 *
 * Estrategia de autenticación (en orden de prioridad):
 *   1. Variable de entorno GOOGLE_APPLICATION_CREDENTIALS (ruta al JSON)
 *   2. Archivo local 'abyss-reader-Credentials.json' en el directorio del proyecto
 *   3. Application Default Credentials (gcloud auth / entorno cloud)
 *
 * Esto permite que el proyecto arranque en dev sin necesidad de
 * configurar la variable de entorno manualmente, siempre que el
 * archivo JSON esté presente en la carpeta back/.
 */
@Configuration
public class StorageConfig {

    private static final Logger log = LoggerFactory.getLogger(StorageConfig.class);

    // Rutas relativas al archivo de credenciales local (dependiendo de si el CWD es pagina/ o pagina/back/)
    private static final String[] LOCAL_CREDENTIALS_PATHS = {
        "abyss-reader-Credentials.json",
        "back/abyss-reader-Credentials.json"
    };

    @Bean
    public Storage googleCloudStorage() throws IOException {
        GoogleCredentials credentials = resolveCredentials();

        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }

    private GoogleCredentials resolveCredentials() throws IOException {
        // 1. Variable de entorno con el JSON en crudo (ideal para Railway / Heroku / Render)
        String envJson = System.getenv("GCP_CREDENTIALS_JSON");
        if (envJson != null && !envJson.isBlank()) {
            log.info("[GCS] Usando credenciales desde la variable de entorno GCP_CREDENTIALS_JSON");
            return GoogleCredentials
                    .fromStream(new java.io.ByteArrayInputStream(envJson.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
        }

        // 2. Variable de entorno con ruta de archivo (GOOGLE_APPLICATION_CREDENTIALS)
        String envPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (envPath != null && !envPath.isBlank()) {
            File envFile = new File(envPath);
            if (envFile.exists()) {
                log.info("[GCS] Usando credenciales de GOOGLE_APPLICATION_CREDENTIALS: {}", envPath);
                return GoogleCredentials
                        .fromStream(new FileInputStream(envFile))
                        .createScoped("https://www.googleapis.com/auth/cloud-platform");
            }
            log.warn("[GCS] GOOGLE_APPLICATION_CREDENTIALS apunta a '{}' pero el archivo no existe.", envPath);
        }

        // 2. Archivos locales en el directorio de trabajo
        for (String path : LOCAL_CREDENTIALS_PATHS) {
            File localFile = new File(path);
            if (localFile.exists()) {
                log.info("[GCS] Usando credenciales locales: {}", localFile.getAbsolutePath());
                return GoogleCredentials
                        .fromStream(new FileInputStream(localFile))
                        .createScoped("https://www.googleapis.com/auth/cloud-platform");
            }
        }

        // 3. Application Default Credentials (fallback para entornos cloud o gcloud CLI)
        log.warn("[GCS] No se encontró archivo de credenciales en las rutas locales.");
        log.warn("[GCS] Si la subida de archivos falla, configurá GOOGLE_APPLICATION_CREDENTIALS o colocá el JSON en la carpeta back/.");
        try {
            return GoogleCredentials.getApplicationDefault()
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
        } catch (IOException e) {
            log.error("[GCS] No se pudo obtener Application Default Credentials. GCS no funcionará.", e);
            // Si todo falla, retornamos credenciales sin autenticación para que el contexto de Spring no crashee
            // Esto permitirá que la app inicie, pero las operaciones a GCS fallarán si se intentan usar
            return GoogleCredentials.create(null);
        }
    }
}

