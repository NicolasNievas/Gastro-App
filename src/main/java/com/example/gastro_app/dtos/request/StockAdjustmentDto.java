package com.example.gastro_app.dtos.request;

import com.example.gastro_app.enums.StockMovementReason;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockAdjustmentDto {

    @NotNull(message = "La cantidad es obligatoria")
    private Integer quantity;           // positivo o negativo

    @NotNull(message = "El motivo es obligatorio")
    private StockMovementReason reason; // MANUAL_ADJUSTMENT o WASTE

    private String notes;
}
