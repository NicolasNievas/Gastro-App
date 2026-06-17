package com.example.gastro_app.dtos.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockAlertDto {
    private List<StockStatusDto> lowStock;    // stock > 0 pero <= umbral
    private List<StockStatusDto> outOfStock;  // sin stock o noStock = true
}
