package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<PaymentEntity, Long> {
    @Query(value = """
    SELECT
        COALESCE(SUM(p.amount),    0),
        COUNT(p.id),
        COALESCE(AVG(p.amount),    0),
        COALESCE(SUM(p.discount),  0),
        COALESCE(SUM(p.surcharge), 0)
    FROM payments p
    WHERE p.created_at BETWEEN :from AND :to
""", nativeQuery = true)
    List<Object[]> findSummaryStats(@Param("from") LocalDateTime from,
                                    @Param("to")   LocalDateTime to);

    @Query(value = """
        SELECT p.method,
               COUNT(p.id)            AS cnt,
               COALESCE(SUM(p.amount), 0) AS total
        FROM payments p
        WHERE p.created_at BETWEEN :from AND :to
        GROUP BY p.method
        ORDER BY total DESC
    """, nativeQuery = true)
    List<Object[]> findByPaymentMethod(@Param("from") LocalDateTime from,
                                       @Param("to")   LocalDateTime to);

    @Query(value = """
        SELECT TO_CHAR(DATE(p.created_at), 'YYYY-MM-DD') AS day,
               COUNT(p.id)                               AS cnt,
               COALESCE(SUM(p.amount), 0)                AS total
        FROM payments p
        WHERE p.created_at BETWEEN :from AND :to
        GROUP BY DATE(p.created_at)
        ORDER BY DATE(p.created_at)
    """, nativeQuery = true)
    List<Object[]> findDailyRevenue(@Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT EXTRACT(HOUR FROM p.created_at)::int AS hour,
               COUNT(p.id)                          AS cnt,
               COALESCE(SUM(p.amount), 0)            AS total
        FROM payments p
        WHERE p.created_at BETWEEN :from AND :to
        GROUP BY EXTRACT(HOUR FROM p.created_at)
        ORDER BY hour
    """, nativeQuery = true)
    List<Object[]> findHourlySales(@Param("from") LocalDateTime from,
                                   @Param("to")   LocalDateTime to);

    @Query(value = """
        SELECT
            pr.name               AS product_name,
            SUM(oi.quantity)::int AS total_quantity,
            COALESCE(SUM(oi.quantity * pr.price), 0) AS total_revenue
        FROM order_items oi
        JOIN products pr ON pr.id = oi.product_id
        JOIN orders o    ON o.id  = oi.order_id
        WHERE o.closed_at BETWEEN :from AND :to
          AND o.state = 'CERRADO'
        GROUP BY pr.name
        ORDER BY total_quantity DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopProducts(@Param("from")  LocalDateTime from,
                                   @Param("to")    LocalDateTime to,
                                   @Param("limit") int limit);
}
