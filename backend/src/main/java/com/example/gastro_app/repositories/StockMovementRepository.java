package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.StockMovementEntity;
import com.example.gastro_app.enums.StockMovementReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovementEntity, Long> {

    @Query("""
           SELECT sm FROM StockMovementEntity sm
           JOIN FETCH sm.product p
           WHERE (:productId IS NULL OR p.id = :productId)
             AND (:reason IS NULL OR sm.reason = :reason)
           ORDER BY sm.createdAt DESC
           """)
    List<StockMovementEntity> findWithFilters(
            @Param("productId") Long productId,
            @Param("reason") StockMovementReason reason);
}
