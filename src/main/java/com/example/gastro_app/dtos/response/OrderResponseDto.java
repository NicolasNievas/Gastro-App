package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponseDto {
    private Long id;
    private TableResponseDto table;
    private String waiterUsername;
    private OrderStatus state;
    private BigDecimal total;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private List<OrderItemResponseDto> items;
    private List<SectorOrderResponseDto> sectorOrders;
}
