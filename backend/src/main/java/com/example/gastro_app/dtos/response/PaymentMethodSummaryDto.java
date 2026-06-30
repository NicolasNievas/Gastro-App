package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodSummaryDto {
    private String     method;
    private String     methodLabel;
    private Integer    count;
    private BigDecimal amount;
    private Double     percentage;
}
