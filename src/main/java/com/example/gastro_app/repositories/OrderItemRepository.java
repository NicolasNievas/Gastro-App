package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.OrderItemEntity;
import com.example.gastro_app.enums.OrderStatus;
import com.example.gastro_app.enums.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {

    @Query("""
           SELECT oi FROM OrderItemEntity oi
           JOIN FETCH oi.product
           WHERE oi.order.id = :orderId AND oi.sector = :sector
           """)
    List<OrderItemEntity> findByOrderIdAndSector(
            @Param("orderId") Long orderId,
            @Param("sector") Sector sector);

    // Para CashierService: todos los ítems abiertos de una mesa (para armar la cuenta)
    @Query("""
           SELECT oi FROM OrderItemEntity oi
           JOIN FETCH oi.product
           WHERE oi.order.table.id = :tableId
             AND oi.order.state = :state
           """)
    List<OrderItemEntity> findByTableIdAndOrderState(
            @Param("tableId") Long tableId,
            @Param("state") OrderStatus state);
}
