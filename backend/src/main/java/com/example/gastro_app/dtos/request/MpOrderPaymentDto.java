package com.example.gastro_app.dtos.request;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderPaymentDto {
    private String amount;
}
