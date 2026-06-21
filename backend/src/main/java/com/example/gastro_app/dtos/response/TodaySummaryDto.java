package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TodaySummaryDto {
    private BigDecimal totalAmount;
    private int salesCount;
}
