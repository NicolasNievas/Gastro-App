package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.Sector;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BillItemDto {
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private Sector sector;
    private BigDecimal subtotal;
}
