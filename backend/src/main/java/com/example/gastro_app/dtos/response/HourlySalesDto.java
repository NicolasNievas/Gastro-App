package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HourlySalesDto {
    private Integer    hour;
    private String     label;
    private Integer    count;
    private BigDecimal amount;
}
