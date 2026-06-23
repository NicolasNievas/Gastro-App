package com.example.gastro_app.dtos.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuCategoryDto {
    private Long id;
    private String name;
    private List<MenuProductDto> products;
}
