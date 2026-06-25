package com.example.gastro_app.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderQrConfigDto {
    @JsonProperty("external_pos_id")
    private String externalPosId;

    private String mode = "static";
}
