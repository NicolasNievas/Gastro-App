package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.response.MpQrResponseDto;
import com.example.gastro_app.services.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/mp")
@RequiredArgsConstructor
@Slf4j
public class MpController {

    private final MercadoPagoService mercadoPagoService;

    @PostMapping("/qr/{tableNumber}")
    public ResponseEntity<MpQrResponseDto> createQrOrder(@PathVariable Integer tableNumber) {
        return ResponseEntity.ok(mercadoPagoService.createQrOrder(tableNumber));
    }

    @PostMapping("/qr/cancel")
    public ResponseEntity<Void> cancelQrOrder(@RequestParam String orderId) {
        mercadoPagoService.cancelQrOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestParam(value = "type",    required = false) String type,
            @RequestParam(value = "data.id", required = false) String dataId,
            @RequestHeader(value = "x-signature",  required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestBody(required = false) Map<String, Object> body) {

        log.info("Webhook MP recibido: type={} dataId={}", type, dataId);

        // La nueva API envía type=order, no type=payment
        if ("order".equals(type) && dataId != null) {
            mercadoPagoService.processOrderWebhook(dataId, xSignature, xRequestId, body);
        }

        // MP espera 200 inmediato — siempre devolver OK
        return ResponseEntity.ok().build();
    }
}
