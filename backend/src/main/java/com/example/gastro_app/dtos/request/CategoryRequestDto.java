package com.example.gastro_app.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryRequestDto {
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    private String name;
}
