package com.abyssreader.api.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Contrato para el servicio de almacenamiento de archivos.
 * Actualmente implementado sobre Google Cloud Storage.
 */
public interface StorageService {

    /**
     * Sube un archivo al almacenamiento en la nube y retorna la URL pública.
     *
     * @param file       archivo multipart a subir
     * @param folderPath ruta de carpeta dentro del bucket (ej: "obras/1/capitulos/1/")
     * @return URL pública del archivo subido
     */
    String uploadFile(MultipartFile file, String folderPath);

    /**
     * Elimina un archivo del almacenamiento en la nube dado su URL pública.
     *
     * @param fileUrl URL pública del archivo a eliminar
     *                (ej: "https://storage.googleapis.com/bucket/path/file.jpg")
     */
    void deleteFile(String fileUrl);
}
