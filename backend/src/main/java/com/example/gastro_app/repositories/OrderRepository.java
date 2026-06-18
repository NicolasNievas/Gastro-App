package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.OrderEntity;
import com.example.gastro_app.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @Query("""
           SELECT o FROM OrderEntity o
           JOIN FETCH o.table t
           JOIN FETCH o.waiter w
           WHERE (:tableId IS NULL OR o.table.id = :tableId)
             AND (:state IS NULL OR o.state = :state)
           ORDER BY o.createdAt DESC
           """)
    List<OrderEntity> findWithFilters(
            @Param("tableId") Long tableId,
            @Param("state") OrderStatus state);

    // JOIN FETCH solo items (no sectorOrders) — evita MultipleBagFetchException
    @Query("""
           SELECT o FROM OrderEntity o
           JOIN FETCH o.table t
           JOIN FETCH o.waiter w
           JOIN FETCH o.items i
           JOIN FETCH i.product
           WHERE o.id = :id
           """)
    Optional<OrderEntity> findWithItemsById(@Param("id") Long id);

    List<OrderEntity> findByTable_IdAndState(Long tableId, OrderStatus state);
}
