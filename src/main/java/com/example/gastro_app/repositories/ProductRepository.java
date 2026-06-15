package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.ProductEntity;
import com.example.gastro_app.enums.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    @Query("""
            SELECT p FROM ProductEntity p
            JOIN FETCH p.category c
            WHERE (:active IS NULL OR p.active = :active)
              AND (:sector IS NULL OR p.sector = :sector)
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
            ORDER BY c.name, p.name
            """)
    List<ProductEntity> findWithFilters(
            @Param("active") Boolean active,
            @Param("sector") Sector sector,
            @Param("categoryId") Long categoryId);

    @Query("SELECT p FROM ProductEntity p JOIN FETCH p.category WHERE p.id = :id")
    Optional<ProductEntity> findByIdWithCategory(@Param("id") Long id);
}
