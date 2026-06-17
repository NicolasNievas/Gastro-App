package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentSummaryDto {
    private Long id;
    private Integer tableNumber;
    private PaymentMethod method;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal surcharge;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private int itemCount;
}
