package com.example.gastro_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
//@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    /*@Bean
    public AuditorAware<String> auditorAware(){
        return () -> {
            try {
                User u = userService.getCurrentUser();
                if (u != null && u.getEmail() != null && !u.getEmail().isBlank()) {
                    return Optional.of(u.getEmail());
                }
            } catch (Exception ignored) {
            }
            return Optional.of("system");
        };
    }*/
}
