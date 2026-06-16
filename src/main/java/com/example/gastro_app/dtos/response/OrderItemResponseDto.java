package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.OrderItemStatus;
import com.example.gastro_app.enums.Sector;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private String notes;
    private Sector sector;
    private OrderItemStatus state;
}
