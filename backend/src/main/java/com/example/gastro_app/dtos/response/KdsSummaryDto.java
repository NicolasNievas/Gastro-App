package com.example.gastro_app.dtos.response;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KdsSummaryDto {
    private long pendientes;
    private long enPreparacion;
    private long listos;
}
