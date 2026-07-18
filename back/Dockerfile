# Etapa 1: Construcción (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copiamos el pom y el código fuente
COPY pom.xml .
COPY src ./src
# Compilamos el proyecto omitiendo los tests para mayor velocidad
RUN mvn clean package -DskipTests

# Etapa 2: Producción (Run)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copiamos solo el archivo .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
# Cloud Run inyecta su propio puerto, pero exponemos el 8080 por convención
EXPOSE 8080
# -XX:MaxRAMPercentage=75.0: limita el heap de Java al 75% de la RAM del contenedor.
# Sin esto, la JVM ignora el límite de Cloud Run y puede ser asesinada por OOM Kill.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
