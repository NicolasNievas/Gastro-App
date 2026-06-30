package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportSummaryDto {
    private BigDecimal totalRevenue;
    private Integer    totalPayments;
    private BigDecimal avgTicket;
    private BigDecimal totalDiscount;
    private BigDecimal totalSurcharge;
    private String     topPaymentMethod;
    private String     topPaymentMethodLabel;
}
