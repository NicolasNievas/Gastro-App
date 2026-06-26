package com.example.gastro_app.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderRequest {
    private String type = "qr";

    @JsonProperty("total_amount")
    private String totalAmount;

    private String description;

    @JsonProperty("external_reference")
    private String externalReference;

    @JsonProperty("expiration_time")
    private String expirationTime = "PT30M";


    private MpOrderConfigDto config;
    private MpOrderTransactionsDto transactions;
    private List<MpOrderItemDto> items;
}
