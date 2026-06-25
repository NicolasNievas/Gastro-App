package com.example.gastro_app.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderItemDto {
    private String title;

    @JsonProperty("unit_price")
    private String unitPrice;

    private Integer quantity;

    @JsonProperty("unit_measure")
    private String unitMeasure = "unit";

    @JsonProperty("external_code")
    private String externalCode;
}
