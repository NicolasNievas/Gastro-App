package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.Sector;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockStatusDto {
    private Long productId;
    private String productName;
    private String categoryName;
    private Sector sector;
    private Integer stock;
    private Integer lowStock;
    private Boolean noStock;
    private String status;       // "OK", "LOW", "EMPTY"
    private String statusLabel;  // "Disponible", "Stock bajo", "Sin stock"
}
