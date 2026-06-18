package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.MesaStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableResponseDto {
    private Long id;
    private Integer number;
    private Integer capacity;
    private MesaStatus state;
    private String stateLabel;          // "Lista para entregar", etc.
    private LocalDateTime openedAt;
    private BigDecimal discount;
    private BigDecimal surcharge;
}
