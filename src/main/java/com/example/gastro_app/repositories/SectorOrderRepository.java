package com.example.gastro_app.repositories;

import com.example.gastro_app.entities.SectorOrderEntity;
import com.example.gastro_app.enums.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectorOrderRepository extends JpaRepository<SectorOrderEntity, Long> {
    // Para el KDS: todos los pendientes/en prep/listos de un sector, ordenados por antigüedad
    // Espejo de: getAllSectorOrders().filter(o => o.sector === sector && o.status !== "entregado")
    @Query("""
           SELECT so FROM SectorOrderEntity so
           JOIN FETCH so.order o
           JOIN FETCH o.table t
           WHERE so.sector = :sector
             AND so.status <> com.example.gastro_app.enums.SectorOrderStatus.ENTREGADO
           ORDER BY so.createdAt ASC
           """)
    List<SectorOrderEntity> findActiveBySector(@Param("sector") Sector sector);

    // Para syncTableStatus: todos los sector orders de pedidos abiertos de una mesa
    @Query("""
           SELECT so FROM SectorOrderEntity so
           WHERE so.order.table.id = :tableId
             AND so.order.state = com.example.gastro_app.enums.OrderStatus.ABIERTO
           """)
    List<SectorOrderEntity> findOpenByTableId(@Param("tableId") Long tableId);

    @Query("SELECT so FROM SectorOrderEntity so WHERE so.order.id = :orderId")
    List<SectorOrderEntity> findByOrderId(@Param("orderId") Long orderId);
}
