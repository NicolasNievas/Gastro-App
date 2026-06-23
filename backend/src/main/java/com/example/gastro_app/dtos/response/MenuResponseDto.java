package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.MesaStatus;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MenuResponseDto {
    private Integer tableNumber;
    private MesaStatus tableState;
    private String tableStateLabel;
    private List<MenuCategoryDto> categories;
}
