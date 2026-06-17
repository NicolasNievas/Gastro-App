package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.CreateOrderRequestDto;
import com.example.gastro_app.dtos.request.UpdateSectorStatusDto;
import com.example.gastro_app.dtos.response.OrderResponseDto;
import com.example.gastro_app.dtos.response.OrderSummaryDto;
import com.example.gastro_app.dtos.response.SectorOrderResponseDto;
import com.example.gastro_app.entities.OrderItemEntity;
import com.example.gastro_app.entities.PaymentEntity;
import com.example.gastro_app.enums.OrderStatus;
import com.example.gastro_app.enums.Sector;

import java.util.List;

public interface OrderService {
    List<OrderSummaryDto> findAll(Long tableId, OrderStatus state);
    OrderResponseDto findById(Long id);
    List<SectorOrderResponseDto> findActiveSectorOrders(Sector sector);
    OrderResponseDto createOrder(CreateOrderRequestDto req, String waiterUsername);
    SectorOrderResponseDto updateSectorStatus(Long sectorOrderId, UpdateSectorStatusDto req);
    List<OrderItemEntity> getOpenItemsByTableId(Long tableId);
    void closeOrdersByTableId(Long tableId, PaymentEntity payment);
}
