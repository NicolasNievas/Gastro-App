package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.MesaStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BillResponseDto {
    private Long tableId;
    private Integer tableNumber;
    private MesaStatus tableState;
    private String tableStateLabel;
    private LocalDateTime openedAt;
    private List<BillItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal surcharge;
    private BigDecimal total;
}
