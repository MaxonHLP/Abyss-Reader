# Abyss Reader 📚

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.14-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue.svg)](https://neon.tech/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Storage_%7C_Run-4285F4.svg)](https://cloud.google.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-orange.svg)](https://github.com/pmndrs/zustand)

Abyss Reader es una plataforma SaaS diseñada para la lectura, publicación y gestión de contenido gráfico secuencial (mangas, manhwas, manhuas). Implementada bajo una arquitectura Monorepo, la plataforma divide sus responsabilidades entre una Single Page Application (SPA) altamente optimizada y una API RESTful robusta y contenerizada, desplegada en Google Cloud.

## 🚀 Arquitectura y Decisiones Técnicas Destacadas

### 1. Sistema Resiliente de Cuentas "Demo" (Identity Management)
Para permitir la exploración sin fricciones de los diferentes roles (Lector, Scanlator, Master), se implementó un sistema de sesiones efímeras:
- **Rate Limiting en Memoria:** Uso de `Bucket4j` en el backend para prevenir abusos en la generación de cuentas Demo.
- **Retención de Identidad en Cliente:** Implementación de tokens de recuperación (`reinitTokens`) persistidos mediante `Zustand`. Esto permite que un usuario cierre sesión en una cuenta Demo y pueda recuperarla sin agotar la cuota de generación de tokens del servidor.

### 2. Borrado Lógico en Cascada (Soft Delete & Poda)
Dada la alta integridad referencial requerida por la base de datos (relaciones entre Usuarios, Obras, Capítulos, Historiales, Grupos y Comentarios), se descartó el uso de `ON DELETE CASCADE` a nivel de motor SQL en favor de una **Estrategia de Desactivación con Reglas de Negocio (Soft Delete)**:
- Cuando una cuenta Demo expira (tarea ejecutada por un `@Scheduled` Cron Job), el sistema bloquea el perfil (`activo = false`) y ejecuta una **Poda Física Selectiva** usando consultas directas de `@Modifying` (`Bulk Updates`). 
- Se purgan datos de alto volumen y bajo valor (Historiales y Guardados de la cuenta) mientras se preserva el contenido estructural de valor (Obras, Grupos y Comentarios creados por el demo), protegiendo la plataforma de errores de Foreign Key y conservando la trazabilidad.

### 3. Infraestructura Serverless & Optimización de Base de Datos
El backend está preparado para auto-escalado horizontal en **Google Cloud Run**:
- **Ajuste de Límites de Memoria (OOM Prevention):** Configuración específica en el `Dockerfile` (`-XX:MaxRAMPercentage=75.0`) para mantener la JVM dentro de los límites del contenedor serverless.
- **Control de Pool de Conexiones:** Ajuste agresivo de `HikariCP` (`maximum-pool-size=5` y `minimum-idle=0`) para evitar asfixiar el límite de conexiones del clúster de Neon DB (PostgreSQL) durante picos de escalado, permitiendo a la vez la suspensión (Cold Start) de la base de datos cuando no hay tráfico para optimizar costos.

### 4. Code-Splitting y Manejo de Assets Multiparte
- **Carga de Alta Concurrencia:** La API procesa carga de imágenes multiparte configurada para aceptar hasta 500MB por petición, interactuando directamente con el SDK de **Google Cloud Storage** para preservar y servir los assets de las obras.
- **Lifecycle Management en Storage:** Eliminación automatizada de los assets temporales mediante reglas nativas de ciclo de vida de los buckets de GCP (Object Lifecycle Management), sin saturar el procesador del backend.
- **Frontend Lazy Loading:** Implementación profunda de Code Splitting en React. El módulo de lectura interactiva (`ChapterReader`) solo se carga cuando es demandado, reduciendo drásticamente el First Contentful Paint (FCP) de la página principal.

---

## 🛠️ Stack Tecnológico

### Frontend (`/front`)
* **Core:** React 19, TypeScript, Vite
* **Estado & Red:** Zustand (v5), Axios (con Interceptores JWT)
* **Estilos:** Tailwind CSS v4
* **Lógica UI:** React Router DOM v7, dnd-kit (Drag and Drop)

### Backend (`/back`)
* **Core:** Java 21, Spring Boot v3.5.14
* **Persistencia:** Spring Data JPA, Hibernate, PostgreSQL Driver
* **Seguridad:** Spring Security, JWT (io.jsonwebtoken), Bucket4j
* **Nube:** Google Cloud Storage SDK

---

## ⚙️ Cómo Ejecutar el Proyecto Localmente

> **Prerrequisitos:** Node.js, Java (JDK 21+) y PostgreSQL.

### 1. Iniciar el Backend (API)
1. Navega a la carpeta de la API:
   ```bash
   cd back
   ```
2. Asegúrate de configurar las variables de entorno para tu BD local en `application.properties`.
3. Ejecuta la aplicación usando el Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(También puedes importar la carpeta `back/` en IntelliJ IDEA o Eclipse y arrancar la clase `ApiApplication.java`).*

### 2. Iniciar el Frontend (SPA)
1. En una nueva terminal, entra al directorio del frontend:
   ```bash
   cd front
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Levanta el servidor de desarrollo en caliente:
   ```bash
   npm run dev
   ```
4. Ingresa a la URL indicada (usualmente `http://localhost:5173`) para explorar la aplicación.
