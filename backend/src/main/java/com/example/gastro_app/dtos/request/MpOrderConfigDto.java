package com.example.gastro_app.dtos.request;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MpOrderConfigDto {
    private MpOrderQrConfigDto qr;
}
