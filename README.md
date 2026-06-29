# Abyss Reader

Abyss Reader es una plataforma web para la lectura y gestión de mangas , manhwas y manhuas. Este repositorio funciona como un **Monorepo**, conteniendo tanto el código del frontend como del backend en sus respectivas carpetas.

## Tecnologías Utilizadas

### Frontend (`/front`)
* **React** con **TypeScript**
* **Zustand** (Manejo de estado global)
* **Vite** (Bundler y entorno de desarrollo)
* **Tailwind CSS** (Estilos y diseño UI)

### Backend (`/back`)
* **Java** con **Spring Boot**
* **Spring Data JPA** / **Hibernate** (Mapeo objeto-relacional)
* **MySQL** (Base de datos relacional)
* **Spring Security** (Autenticación y Autorización)

---

## Cómo Ejecutar el Proyecto Localmente

Para levantar el proyecto en tu entorno local, necesitas tener instalado **Node.js**, **Java (JDK 17+)** y **MySQL**.

### 1. Iniciar el Backend (Spring Boot)
1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd back
   ```
2. Configura las credenciales de tu base de datos en `back/src/main/resources/application.properties` (o el archivo `.yml` correspondiente) para que coincidan con tu servidor MySQL local.
3. Ejecuta el proyecto. Si usas Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(Alternativamente, puedes abrir la carpeta `back/` con IntelliJ IDEA o Eclipse y ejecutar la clase principal `AbyssReaderApplication`)*.

### 2. Iniciar el Frontend (React)
1. Abre una nueva pestaña en tu terminal y navega a la carpeta del frontend:
   ```bash
   cd front
   ```
2. Instala las dependencias (solo es necesario hacerlo la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre la URL que te indica la terminal (usualmente `http://localhost:5173`) en tu navegador web.
