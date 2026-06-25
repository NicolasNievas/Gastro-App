package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpQrResponseDto {
    private String orderId;       // ID de la order en MP
    private String qrImageUrl;    // URL de la imagen QR del POS
    private BigDecimal amount;
    private Integer tableNumber;
    private String externalReference;
}
