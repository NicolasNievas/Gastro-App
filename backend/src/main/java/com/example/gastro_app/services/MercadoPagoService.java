package com.example.gastro_app.services;

import com.example.gastro_app.dtos.response.MpQrResponseDto;

import java.util.Map;

public interface MercadoPagoService {
    MpQrResponseDto createQrOrder(Integer tableNumber);
    void cancelQrOrder(String orderId);
    void processOrderWebhook(String orderId, String xSignature,
                             String xRequestId, Map<String, Object> body);
}
