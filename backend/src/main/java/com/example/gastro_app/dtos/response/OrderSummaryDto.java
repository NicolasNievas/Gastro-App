package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderSummaryDto {
    private Long id;
    private Integer tableNumber;
    private OrderStatus state;
    private BigDecimal total;
    private String note;
    private LocalDateTime createdAt;
}
