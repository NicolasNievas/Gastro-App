package com.example.gastro_app.dtos.request;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderTransactionsDto {
    private List<MpOrderPaymentDto> payments;
}
