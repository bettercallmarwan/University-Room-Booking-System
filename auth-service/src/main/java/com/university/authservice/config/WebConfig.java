package com.university.authservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebConfig {

    // @Bean
    // public CorsFilter corsFilter() {
    //     UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    //     CorsConfiguration config = new CorsConfiguration();
    //     config.addAllowedOrigin("http://localhost:3000");
    //     config.addAllowedMethod("GET");
    //     config.addAllowedMethod("POST");
    //     config.addAllowedMethod("PUT");
    //     config.addAllowedMethod("DELETE");
    //     config.addAllowedMethod("OPTIONS");
    //     config.addAllowedHeader("*");
    //     config.setAllowCredentials(true);
    //     config.setMaxAge(3600L);
    //     source.registerCorsConfiguration("/**", config);
    //     return new CorsFilter(source);
    // }
}