package com.abyssreader.api.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public FilterRegistrationBean<CorsFilter> customCorsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Permitir credenciales (Tokens)
        config.setAllowCredentials(true);
        
        // 2. Orígenes exactos (Sin barra al final)
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("https://abyss-reader.vercel.app");
        
        // 3. Permitir TODOS los métodos (GET, POST, OPTIONS, etc.)
        config.addAllowedMethod("*");
        
        // 4. Permitir TODOS los encabezados
        config.addAllowedHeader("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        // 5. LA MAGIA: Forzar que este filtro sea el PRIMERO en ejecutarse
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        
        return bean;
    }
}
