package com.example.gastro_app.dtos.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryResponseDto {
    private Long id;
    private String name;
    private Boolean active;
    private LocalDateTime createdAt;
}
