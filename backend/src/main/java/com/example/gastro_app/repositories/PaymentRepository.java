package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.PaymentEntity;
import com.example.gastro_app.enums.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    @Query("""
           SELECT p FROM PaymentEntity p
           JOIN FETCH p.table t
           WHERE (:tableNumber IS NULL OR t.number = :tableNumber)
             AND (:method IS NULL OR p.method = :method)
           ORDER BY p.createdAt DESC
           """)
    List<PaymentEntity> findWithFilters(
            @Param("tableNumber") Integer tableNumber,
            @Param("method") PaymentMethod method);

    @Query("SELECT p FROM PaymentEntity p JOIN FETCH p.table WHERE p.id = :id")
    Optional<PaymentEntity> findByIdWithTable(@Param("id") Long id);

    @Query("SELECT p FROM PaymentEntity p WHERE p.createdAt >= :start AND p.createdAt < :end")
    List<PaymentEntity> findByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
