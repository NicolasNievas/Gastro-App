package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.Sector;
import com.example.gastro_app.enums.SectorOrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SectorOrderResponseDto {
    private Long id;
    private Long orderId;
    private Integer tableNumber;
    private Sector sector;
    private SectorOrderStatus status;
    private String statusLabel;
    private String orderNote;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDto> items;
}
