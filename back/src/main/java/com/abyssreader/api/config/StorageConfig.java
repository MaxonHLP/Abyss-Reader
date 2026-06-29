package com.abyssreader.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

/**
 * Configuración del cliente de Google Cloud Storage.
 * La ruta al archivo de credenciales JSON se lee de la variable de entorno
 * GOOGLE_APPLICATION_CREDENTIALS (estándar de Google Cloud SDK).
 */
@Configuration
public class StorageConfig {

    @Bean
    public Storage googleCloudStorage() throws IOException {
        String credentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");

        if (credentialsPath == null || credentialsPath.isBlank()) {
            throw new IllegalStateException(
                "La variable de entorno GOOGLE_APPLICATION_CREDENTIALS no está definida. " +
                "Debe apuntar a la ruta absoluta del archivo JSON de credenciales de la cuenta de servicio."
            );
        }

        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(credentialsPath))
                .createScoped("https://www.googleapis.com/auth/cloud-platform");

        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }
}
