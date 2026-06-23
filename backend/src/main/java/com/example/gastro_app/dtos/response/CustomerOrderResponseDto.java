package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerOrderResponseDto {
    private Long orderId;
    private Integer tableNumber;
    private String message;
    private List<CustomerOrderItemDto> items;
    private BigDecimal total;
}
