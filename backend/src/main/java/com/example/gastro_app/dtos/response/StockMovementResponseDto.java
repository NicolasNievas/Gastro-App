package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.StockMovementReason;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockMovementResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantityChange;  // negativo = salida, positivo = entrada
    private StockMovementReason reason;
    private String reasonLabel;
    private LocalDateTime createdAt;
}
