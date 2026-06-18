package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.Sector;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponseDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private CategoryResponseDto category;
    private Sector sector;
    private Integer stock;
    private Integer lowStock;
    private Boolean noStock;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
