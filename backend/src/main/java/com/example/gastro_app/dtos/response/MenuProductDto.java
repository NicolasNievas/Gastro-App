package com.example.gastro_app.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuProductDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private String sector;
    private boolean available;
}
