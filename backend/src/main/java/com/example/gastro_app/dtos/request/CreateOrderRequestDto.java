package com.example.gastro_app.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderRequestDto {

    @NotNull(message = "La mesa es obligatoria")
    private Long tableId;

    private String note;

    @NotEmpty(message = "La comanda debe tener al menos un producto")
    @Valid
    private List<OrderItemRequestDto> items;
}
