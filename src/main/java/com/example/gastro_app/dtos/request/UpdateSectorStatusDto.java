package com.example.gastro_app.dtos.request;

import com.example.gastro_app.enums.SectorOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSectorStatusDto {

    @NotNull(message = "El estado es obligatorio")
    private SectorOrderStatus status;
}
