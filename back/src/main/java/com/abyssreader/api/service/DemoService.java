package com.abyssreader.api.service;

import com.abyssreader.api.dto.auth.AuthResponse;
import com.abyssreader.api.entity.*;
import com.abyssreader.api.exception.DemoCapacityException;
import com.abyssreader.api.exception.DemoRateLimitException;
import com.abyssreader.api.repository.*;
import com.abyssreader.api.util.JwtTokenProvider;
import com.abyssreader.api.util.Rol;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Random;

/**
 * Servicio central del sistema de cuentas demo efímeras.
 *
 * Responsabilidades:
 * - Crear cuentas demo únicas con TTL de 1 hora.
 * - Implementar el flujo de token dual (activo + reinicio).
 * - Verificar rate limiting por IP y cap global de 50 demos.
 * - Crear el entorno completo para cuentas MIEMBRO_ADMIN demo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DemoService {

    private static final int MAX_DEMOS_GLOBALES = 50;
    private static final long DEMO_TTL_HORAS = 1;

    private final UsuarioRepository usuarioRepository;
    private final MiembroRepository miembroRepository;
    private final GrupoRepository grupoRepository;
    private final ObraRepository obraRepository;
    private final TipoRepository tipoRepository;
    private final DemografiaRepository demografiaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final DemoRateLimiterService rateLimiterService;

    /**
     * Punto de entrada principal. Crea una cuenta demo o reutiliza la existente
     * según el flujo de token de reinicio.
     *
     * @param rol         El rol solicitado: "LECTOR", "MASTER" o "MIEMBRO_ADMIN".
     * @param ip          La IP del cliente para rate limiting.
     * @param reinitToken El token de reinicio si el usuario ya inició una sesión demo previa con este rol.
     * @return AuthResponse con el token activo, el reinitToken y los datos del usuario.
     */
    @Transactional
    public AuthResponse crearOReanudarCuentaDemo(String rol, String ip, String reinitToken) {
        // --- FLUJO DE REINICIO: si viene reinitToken, intentar reutilizar la cuenta existente ---
        if (reinitToken != null && !reinitToken.isBlank()) {
            Optional<AuthResponse> reinicio = intentarReinicio(reinitToken);
            if (reinicio.isPresent()) {
                log.info("Demo Reinicio: cuenta reutilizada para rol {} desde IP {}", rol, ip);
                return reinicio.get();
            }
            // Si el reinitToken es inválido o expiró, crear cuenta nueva sin bloquearse
            log.info("Demo Reinicio: token inválido o expirado para rol {}, creando cuenta nueva", rol);
        }

        // --- FLUJO DE CREACIÓN NUEVA ---
        // 1. Rate limiting por IP
        if (!rateLimiterService.isAllowed(ip)) {
            log.warn("Demo Rate Limit: IP {} superó el límite de {} cuentas en 6 horas", ip, 6);
            throw new DemoRateLimitException("RATE_LIMIT");
        }

        // 2. Cap global
        long demosActivos = usuarioRepository.countDemosActivosAhora(LocalDateTime.now());
        if (demosActivos >= MAX_DEMOS_GLOBALES) {
            log.warn("Demo Cap Global: se alcanzaron {} cuentas demo activas", MAX_DEMOS_GLOBALES);
            throw new DemoCapacityException("CAPACITY_LIMIT");
        }

        // 3. Crear la cuenta según el rol
        return crearNuevaCuentaDemo(Rol.valueOf(rol), ip);
    }

    // ========================================================================
    // Flujo de reinicio de sesión
    // ========================================================================

    /**
     * Intenta reanudar una sesión demo existente usando el hash del reinitToken.
     * Si el usuario existe, está activo y no expiró, emite un nuevo token activo.
     */
    private Optional<AuthResponse> intentarReinicio(String reinitTokenRaw) {
        try {
            String hash = hashToken(reinitTokenRaw);
            Optional<Usuario> usuarioOpt = usuarioRepository.findByReinitToken(hash);

            if (usuarioOpt.isEmpty()) return Optional.empty();

            Usuario usuario = usuarioOpt.get();

            // Verificar que la cuenta demo no esté expirada
            if (usuario.getExpiracionDemo() == null || usuario.getExpiracionDemo().isBefore(LocalDateTime.now())) {
                log.info("Demo Reinicio: cuenta {} ya expiró", usuario.getMail());
                return Optional.empty();
            }

            // Emitir nuevo token activo (1h desde ahora)
            String nuevoToken = jwtTokenProvider.generarTokenDemo(
                    usuario.getMail(), usuario.getId(), usuario.getRol());

            Long grupoId = null;
            if (usuario instanceof Miembro m && m.getGrupo() != null) {
                grupoId = m.getGrupo().getId();
            }

            log.info("Demo Reinicio exitoso: usuario {} ({})", usuario.getNombre(), usuario.getRol());
            return Optional.of(new AuthResponse(
                    nuevoToken,
                    usuario.getMail(),
                    usuario.getNombre(),
                    usuario.getRol(),
                    grupoId,
                    usuario.getFotoPerfil(),
                    reinitTokenRaw,   // Devolver el mismo reinitToken (sigue vigente)
                    true
            ));
        } catch (Exception e) {
            log.error("Error al intentar reinicio de sesión demo: {}", e.getMessage());
            return Optional.empty();
        }
    }

    // ========================================================================
    // Creación de cuenta nueva
    // ========================================================================

    private AuthResponse crearNuevaCuentaDemo(Rol rol, String ip) {
        LocalDateTime expiracion = LocalDateTime.now().plusHours(DEMO_TTL_HORAS);
        String sufijo = generarSufijo4Digitos();

        if (rol == Rol.MIEMBRO_ADMIN) {
            return crearMiembroAdminDemo(sufijo, expiracion);
        } else if (rol == Rol.MASTER) {
            return crearUsuarioSimpleDemo("MasterDemo_" + sufijo, rol, expiracion);
        } else {
            return crearUsuarioSimpleDemo("LectorDemo_" + sufijo, rol, expiracion);
        }
    }

    /**
     * Crea un usuario demo simple (LECTOR o MASTER) sin entorno adicional.
     */
    private AuthResponse crearUsuarioSimpleDemo(String nombre, Rol rol, LocalDateTime expiracion) {
        String mail = nombre + "@demo.temp";
        String contrasenaRandom = generarContrasenaRandom();

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setMail(mail);
        usuario.setContrasena(passwordEncoder.encode(contrasenaRandom));
        usuario.setRol(rol);
        usuario.setEsDemo(true);
        usuario.setActivo(true);
        usuario.setExpiracionDemo(expiracion);

        Usuario saved = usuarioRepository.save(usuario);

        // Generar tokens y guardar hash del reinitToken
        String tokenActivo = jwtTokenProvider.generarTokenDemo(saved.getMail(), saved.getId(), saved.getRol());
        String reinitTokenRaw = jwtTokenProvider.generarTokenDemo(saved.getMail(), saved.getId(), saved.getRol());
        saved.setReinitToken(hashToken(reinitTokenRaw));
        usuarioRepository.save(saved);

        log.info("Demo Creado: {} ({}) - expira: {}", nombre, rol, expiracion);

        return new AuthResponse(tokenActivo, saved.getMail(), saved.getNombre(),
                saved.getRol(), null, saved.getFotoPerfil(), reinitTokenRaw, true);
    }

    /**
     * Crea un MIEMBRO_ADMIN demo con su entorno completo:
     * - El propio MiembroAdmin (en tabla miembros)
     * - Un Grupo "grupo prueba XXX"
     * - Un Miembro extra demo asignado al grupo
     * - Una Obra demo asignada al grupo
     */
    private AuthResponse crearMiembroAdminDemo(String sufijo, LocalDateTime expiracion) {
        String nombreAdmin = "MiembroDemo_" + sufijo;
        String mailAdmin = nombreAdmin + "@demo.temp";
        String sufijoGrupo = generarSufijo3Digitos();

        // 1. Crear el Grupo primero
        Grupo grupo = new Grupo();
        grupo.setNombre("grupo prueba " + sufijoGrupo);
        grupo.setDescripcion("Grupo de demostración creado automáticamente. Expira en 1 hora.");
        grupo.setActivo(true);
        Grupo grupoSaved = grupoRepository.save(grupo);

        // 2. Crear el Miembro Admin y asignarlo al grupo
        Miembro admin = new Miembro();
        admin.setNombre(nombreAdmin);
        admin.setMail(mailAdmin);
        admin.setContrasena(passwordEncoder.encode(generarContrasenaRandom()));
        admin.setRol(Rol.MIEMBRO_ADMIN);
        admin.setEsDemo(true);
        admin.setActivo(true);
        admin.setExpiracionDemo(expiracion);
        admin.setGrupo(grupoSaved);
        Miembro adminSaved = miembroRepository.save(admin);

        // 3. Crear un Miembro extra demo para el grupo
        String sufijoExtra = generarSufijo4Digitos();
        String nombreExtra = "MiembroDemo_" + sufijoExtra;
        Miembro miembroExtra = new Miembro();
        miembroExtra.setNombre(nombreExtra);
        miembroExtra.setMail(nombreExtra + "@demo.temp");
        miembroExtra.setContrasena(passwordEncoder.encode(generarContrasenaRandom()));
        miembroExtra.setRol(Rol.MIEMBRO);
        miembroExtra.setEsDemo(true);
        miembroExtra.setActivo(true);
        miembroExtra.setExpiracionDemo(expiracion);
        miembroExtra.setGrupo(grupoSaved);
        miembroRepository.save(miembroExtra);

        // 4. Crear una Obra demo y asignarla al grupo
        crearObraDemo(grupoSaved, adminSaved.getId());

        // 5. Generar tokens
        String tokenActivo = jwtTokenProvider.generarTokenDemo(
                adminSaved.getMail(), adminSaved.getId(), adminSaved.getRol());
        String reinitTokenRaw = jwtTokenProvider.generarTokenDemo(
                adminSaved.getMail(), adminSaved.getId(), adminSaved.getRol());
        adminSaved.setReinitToken(hashToken(reinitTokenRaw));
        miembroRepository.save(adminSaved);

        log.info("Demo MIEMBRO_ADMIN Creado: {} - Grupo: {} - expira: {}",
                nombreAdmin, grupoSaved.getNombre(), expiracion);

        return new AuthResponse(tokenActivo, adminSaved.getMail(), adminSaved.getNombre(),
                adminSaved.getRol(), grupoSaved.getId(), adminSaved.getFotoPerfil(), reinitTokenRaw, true);
    }

    /**
     * Crea una obra demo asignada al grupo del MIEMBRO_ADMIN demo.
     * Toma el primer Tipo y Demografía disponibles en la BD.
     */
    private void crearObraDemo(Grupo grupo, Long creadorId) {
        // Obtener el primer Tipo disponible
        List<Tipo> tipos = tipoRepository.findAll(PageRequest.of(0, 1)).getContent();
        List<Demografia> demografias = demografiaRepository.findAll(PageRequest.of(0, 1)).getContent();

        if (tipos.isEmpty() || demografias.isEmpty()) {
            log.warn("Demo Obra: no hay Tipos o Demografías disponibles, se omite la creación de la obra demo.");
            return;
        }

        Obra obra = new Obra();
        obra.setTitulo("Obra Demo de " + grupo.getNombre());
        obra.setDescripcion("Obra de demostración creada automáticamente junto con la cuenta demo. " +
                "Explora las funcionalidades de gestión de contenido.");
        obra.setTipo(tipos.get(0));
        obra.setDemografia(demografias.get(0));
        obra.setGrupo(grupo);
        obra.setDataCore(false);
        obra.setVistas(0);
        obra.setLikes(0);
        obra.setCreadorId(creadorId);

        obraRepository.save(obra);
        log.info("Demo Obra creada: '{}' para grupo '{}'", obra.getTitulo(), grupo.getNombre());
    }

    // ========================================================================
    // Utilidades
    // ========================================================================

    /**
     * Genera un sufijo numérico de 4 dígitos para el nombre del usuario demo.
     * Rango: 1000-9999.
     */
    private String generarSufijo4Digitos() {
        return String.format("%04d", new Random().nextInt(9000) + 1000);
    }

    /**
     * Genera un sufijo numérico de 3 dígitos para el nombre del grupo demo.
     * Rango: 100-999.
     */
    private String generarSufijo3Digitos() {
        return String.format("%03d", new Random().nextInt(900) + 100);
    }

    /**
     * Genera una contraseña aleatoria de 16 caracteres para las cuentas demo.
     * Las cuentas demo no necesitan contraseña usable (el acceso es por token).
     */
    private String generarContrasenaRandom() {
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    /**
     * Hashea el reinitToken con SHA-256 para almacenarlo de forma segura en la BD.
     * No se almacena el JWT en texto plano para proteger contra ataques de dumping de BD.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 64);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }
}
