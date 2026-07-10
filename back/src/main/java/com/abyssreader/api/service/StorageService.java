package com.abyssreader.api.service;

import com.abyssreader.api.dto.capitulo.SignedUrlRequestItem;
import com.abyssreader.api.dto.capitulo.SignedUrlsResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    /**
     * Genera URLs firmadas V4 para que el cliente pueda subir archivos directamente a GCS
     * sin pasar por el servidor. Cada URL es válida por 15 minutos y solo acepta PUT
     * con el Content-Type exacto especificado en el item.
     *
     * @param archivos   lista de descriptores de archivo ({nombre, tipo})
     * @param folderPath ruta de carpeta destino dentro del bucket (ej: "obras/1/capitulos/2/")
     * @return DTO con una lista de pares (uploadUrl firmada, publicUrl final)
     */
    SignedUrlsResponseDTO generarUrlsFirmadas(List<SignedUrlRequestItem> archivos, String folderPath);
}
