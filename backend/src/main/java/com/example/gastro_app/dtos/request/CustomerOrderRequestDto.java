package com.example.gastro_app.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerOrderRequestDto {

    @NotEmpty(message = "La comanda debe tener al menos un producto")
    @Valid
    private List<OrderItemRequestDto> items;

    private String note;
}
