package com.example.gastro_app.dtos.request;

import com.example.gastro_app.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloseCashierRequestDto {

    @NotNull(message = "El método de pago es obligatorio")
    private PaymentMethod paymentMethod;

    private String notes;
}
