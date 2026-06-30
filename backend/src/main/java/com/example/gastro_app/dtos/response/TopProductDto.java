package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopProductDto {
    private String     productName;
    private Integer    totalQuantity;
    private BigDecimal totalRevenue;
}
