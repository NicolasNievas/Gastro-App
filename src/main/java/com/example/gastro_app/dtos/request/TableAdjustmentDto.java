package com.example.gastro_app.dtos.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableAdjustmentDto {

    @NotNull(message = "El descuento es obligatorio")
    @DecimalMin(value = "0.00", message = "El descuento no puede ser negativo")
    private BigDecimal discount;

    @NotNull(message = "El recargo es obligatorio")
    @DecimalMin(value = "0.00", message = "El recargo no puede ser negativo")
    private BigDecimal surcharge;
}
