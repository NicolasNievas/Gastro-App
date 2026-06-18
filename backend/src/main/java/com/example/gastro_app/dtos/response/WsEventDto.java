package com.example.gastro_app.dtos.response;

import com.example.gastro_app.enums.WsEventType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WsEventDto<T> {

    private String type;
    private T payload;
    private String timestamp;

    public static  <T> WsEventDto<T> of(WsEventType type, T payload) {
        return WsEventDto.<T>builder()
                .type(type.name())
                .payload(payload)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
