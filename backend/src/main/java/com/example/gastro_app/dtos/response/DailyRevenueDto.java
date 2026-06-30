package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DailyRevenueDto {
    private String     date;
    private BigDecimal amount;
    private Integer    count;
}
