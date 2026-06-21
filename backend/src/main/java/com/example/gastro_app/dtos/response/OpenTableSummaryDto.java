package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.MesaStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OpenTableSummaryDto {
    private Long tableId;
    private Integer tableNumber;
    private MesaStatus state;
    private String stateLabel;
    private LocalDateTime openedAt;
    private BigDecimal total;
}
