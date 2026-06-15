package com.example.gastro_app.config;

import com.example.gastro_app.entities.CategoryEntity;
import com.example.gastro_app.entities.ProductEntity;
import com.example.gastro_app.entities.UserEntity;
import com.example.gastro_app.enums.Role;
import com.example.gastro_app.enums.Sector;
import com.example.gastro_app.repositories.CategoryRepository;
import com.example.gastro_app.repositories.ProductRepository;
import com.example.gastro_app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    private void seedUsers() {
        List.of(
                new Object[]{"admin",   "admin123",   Role.ADMIN},
                new Object[]{"mozo1",   "mozo123",    Role.MOZO},
                new Object[]{"cocina1", "cocina123",  Role.COCINA},
                new Object[]{"barra1",  "barra123",   Role.BARRA},
                new Object[]{"caja1",   "caja123",    Role.CAJA}
        ).forEach(u -> {
            String username = (String) u[0];
            if (userRepository.findByUsername(username).isEmpty()) {
                userRepository.save(UserEntity.builder()
                        .username(username)
                        .passwordHash(passwordEncoder.encode((String) u[1]))
                        .role((Role) u[2])
                        .active(true).build());
                log.info("Usuario: {} / {} ({})", u[0], u[1], ((Role)u[2]).name());
            }
        });
    }

    private void seedCatalog() {
        if (categoryRepository.count() > 0) return;

        // Categorías — igual que CATEGORIES en app.js
        Map<String, CategoryEntity> cats = new LinkedHashMap<>();
        List.of("Hamburguesas", "Papas / acompañamientos",
                        "Bebidas sin alcohol", "Cervezas", "Fernet", "Combos")
                .forEach(name -> {
                    CategoryEntity c = categoryRepository.save(
                            CategoryEntity.builder().name(name).active(true).build());
                    cats.put(name, c);
                });

        // Productos — espejo exacto del seedState() de app.js
        List.of(
                // { nombre, categoría, precio, sector, stock, lowStock }
                new Object[]{"Hamburguesa Clásica",     "Hamburguesas", 6800, Sector.COCINA, 35, 10},
                new Object[]{"Hamburguesa Doble Cheddar","Hamburguesas",8200, Sector.COCINA, 28, 10},
                new Object[]{"Hamburguesa Callejón",    "Hamburguesas", 9200, Sector.COCINA, 22,  8},
                new Object[]{"Hamburguesa Completa",    "Hamburguesas", 8800, Sector.COCINA, 20,  8},
                new Object[]{"Hamburguesa Veggie",      "Hamburguesas", 7600, Sector.COCINA, 12,  5},
                new Object[]{"Papas fritas",            "Papas / acompañamientos", 4200, Sector.COCINA, 45, 15},
                new Object[]{"Papas con cheddar",       "Papas / acompañamientos", 5600, Sector.COCINA, 18,  8},
                new Object[]{"Papas Callejón",          "Papas / acompañamientos", 6400, Sector.COCINA,  9,  5},
                new Object[]{"Coca-Cola",               "Bebidas sin alcohol", 2400, Sector.BARRA, 70, 20},
                new Object[]{"Sprite",                  "Bebidas sin alcohol", 2400, Sector.BARRA, 45, 15},
                new Object[]{"Agua",                    "Bebidas sin alcohol", 1900, Sector.BARRA, 55, 15},
                new Object[]{"Agua saborizada",         "Bebidas sin alcohol", 2200, Sector.BARRA, 30, 10},
                new Object[]{"Cerveza rubia",           "Cervezas", 3800, Sector.BARRA, 60, 20},
                new Object[]{"Cerveza roja",            "Cervezas", 4200, Sector.BARRA, 32, 10},
                new Object[]{"Cerveza negra",           "Cervezas", 4400, Sector.BARRA, 24,  8},
                new Object[]{"Pinta artesanal",         "Cervezas", 4600, Sector.BARRA, 38, 10},
                new Object[]{"Botella de cerveza",      "Cervezas", 5200, Sector.BARRA, 26,  8},
                new Object[]{"Fernet con Coca vaso",    "Fernet", 4600,  Sector.BARRA, 40, 10},
                new Object[]{"Fernet con Coca jarra",   "Fernet", 11800, Sector.BARRA, 16,  5},
                new Object[]{"Fernet botella",          "Fernet", 24500, Sector.BARRA,  7,  3},
                new Object[]{"Combo Fernet + Coca",     "Fernet", 27500, Sector.BARRA, 10,  3},
                new Object[]{"Combo hamburguesa clásica + papas + bebida","Combos",12500,Sector.COCINA,25,5},
                new Object[]{"Combo doble cheddar + papas + cerveza",     "Combos",15800,Sector.COCINA,18,5},
                new Object[]{"Combo Callejón + papas + fernet",           "Combos",18400,Sector.COCINA,14,5}
        ).forEach(p -> productRepository.save(ProductEntity.builder()
                .name((String) p[0])
                .category(cats.get((String) p[1]))
                .price(BigDecimal.valueOf((int) p[2]))
                .sector((Sector) p[3])
                .stock((int) p[4])
                .lowStock((int) p[5])
                .noStock(false).active(true)
                .build()));

        log.info("Seed: {} categorías, {} productos", cats.size(), productRepository.count());
    }
}
