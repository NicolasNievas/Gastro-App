package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.response.MpQrResponseDto;
import com.example.gastro_app.services.MercadoPagoService;
import jakarta.servlet.http.HttpServletRequest;
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
            HttpServletRequest request,
            @RequestHeader(value = "x-signature",  required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId,
            @RequestBody(required = false) Map<String, Object> body) {

        String type   = request.getParameter("type");
        String dataId = request.getParameter("data.id");

        log.info("Webhook MP recibido: type={} dataId={} xRequestId={}", type, dataId, xRequestId);

        if ("order".equals(type) && dataId != null) {
            try {
                mercadoPagoService.processOrderWebhook(dataId, xSignature, xRequestId, body);
            } catch (Exception e) {
                // Logueamos pero NO propagamos — MP necesita el 200
                log.error("Error procesando webhook MP (orden {} no bloqueada): {}", dataId, e.getMessage());
            }
        }

        return ResponseEntity.ok().build();
    }
}
