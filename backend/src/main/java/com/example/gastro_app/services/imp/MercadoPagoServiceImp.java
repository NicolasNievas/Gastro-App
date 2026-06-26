package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.request.*;
import com.example.gastro_app.dtos.response.MpQrResponseDto;
import com.example.gastro_app.entities.OrderItemEntity;
import com.example.gastro_app.entities.TableEntity;
import com.example.gastro_app.enums.MesaStatus;
import com.example.gastro_app.enums.PaymentMethod;
import com.example.gastro_app.exceptions.BusinessException;
import com.example.gastro_app.repositories.TableRepository;
import com.example.gastro_app.services.CashierService;
import com.example.gastro_app.services.MercadoPagoService;
import com.example.gastro_app.services.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MercadoPagoServiceImp implements MercadoPagoService {

    private final TableRepository tableRepository;
    private final OrderService orderService;
    private final CashierService cashierService;
    private final ObjectMapper objectMapper;

    @Value("${mp.access-token}")       private String accessToken;
    @Value("${mp.webhook-secret:}")    private String webhookSecret;
    @Value("${mp.pos-external-id}")    private String posExternalId;
    @Value("${mp.qr-image-url}")       private String qrImageUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MP_ORDERS_URL = "https://api.mercadopago.com/v1/orders";

    // ── Crear orden en el QR del POS ─────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public MpQrResponseDto createQrOrder(Integer tableNumber) {
        TableEntity table = getTableOrThrow(tableNumber);

        if (table.getState() == MesaStatus.LIBRE){
            throw new BusinessException("La mesa no tiene pedidos activos");
        }

        List<OrderItemEntity> items = orderService.getOpenItemsByTableId(table.getId());
        if (items.isEmpty()) {
            throw new BusinessException("La mesa no tiene productos para cobrar");
        }

        BigDecimal subtotal = calcularSubtotal(items);
        BigDecimal discount = nvl(table.getDiscount());
        BigDecimal surcharge = nvl(table.getSurcharge());
        BigDecimal finalTotal = subtotal.subtract(discount).add(surcharge).max(BigDecimal.ZERO);

        String externalRef = "TABLE-" + table.getId() + "-" + tableNumber;
        String totalStr    = finalTotal.setScale(2).toPlainString();

        // ── Construir ítems ───────────────────────────────────────────
        // Usamos un ítem resumen con el total final para evitar discrepancias
        // entre precios individuales y descuento/recargo aplicado
        List<MpOrderItemDto> mpItems = List.of(
                MpOrderItemDto.builder()
                        .title("Mesa " + tableNumber + " — Callejón Güemes")
                        .unitPrice(totalStr)
                        .quantity(1)
                        .unitMeasure("unit")
                        .externalCode("MESA-" + tableNumber)
                        .build()
        );

        // ── Construir la orden ────────────────────────────────────────
        MpOrderRequest orderRequest = MpOrderRequest.builder()
                .type("qr")
                .totalAmount(totalStr)
                .description("Mesa " + tableNumber + " - " + items.size() + " producto(s)")
                .externalReference(externalRef)
                .expirationTime("PT30M")
                .config(MpOrderConfigDto.builder()
                        .qr(MpOrderQrConfigDto.builder()
                                .externalPosId(posExternalId)
                                .mode("static")
                                .build())
                        .build())
                .transactions(MpOrderTransactionsDto.builder()
                        .payments(List.of(MpOrderPaymentDto.builder()
                                .amount(totalStr)
                                .build()))
                        .build())
                .items(mpItems)
                .build();

        // ── Llamar a la API de MP ─────────────────────────────────────
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("X-Idempotency-Key", java.util.UUID.randomUUID().toString());
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        HttpEntity<MpOrderRequest> request = new HttpEntity<>(orderRequest, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    MP_ORDERS_URL, HttpMethod.POST, request, Map.class);

            Map<?, ?> body = response.getBody();
            String orderId = body != null ? (String) body.get("id") : null;

            log.info("Orden MP creada: orderId={} mesa={} total={}", orderId, tableNumber, totalStr);

            return MpQrResponseDto.builder()
                    .orderId(orderId)
                    .qrImageUrl(qrImageUrl)
                    .amount(finalTotal)
                    .tableNumber(tableNumber)
                    .externalReference(externalRef)
                    .build();

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Error MP al crear orden: {} — {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException("Error al cargar el pago en el QR: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error inesperado MP: {}", e.getMessage());
            throw new BusinessException("Error al conectar con Mercado Pago: " + e.getMessage());
        }
    }

    @Override
    public void cancelQrOrder(String orderId) {
        if (orderId == null || orderId.isBlank()) return;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("X-Idempotency-Key", java.util.UUID.randomUUID().toString());
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    MP_ORDERS_URL + "/" + orderId + "/cancel",
                    HttpMethod.POST, request, String.class);
            log.info("Orden MP {} cancelada", orderId);
        } catch (Exception e) {
            log.warn("No se pudo cancelar la orden MP {}: {}", orderId, e.getMessage());
        }
    }

    @Override
    public void processOrderWebhook(String orderId, String xSignature, String xRequestId, Map<String, Object> body) {

        // Validar firma HMAC
        if (webhookSecret != null && !webhookSecret.isBlank() && xSignature != null) {
            validateSignature(orderId, xSignature, xRequestId);
        }

        // Extraer acción del body
        String action = body != null ? (String) body.get("action") : null;
        log.info("Webhook MP order: orderId={} action={}", orderId, action);

        // Solo procesar si el pago fue exitoso
        if (!"order.processed".equals(action)) {
            log.info("Evento {} ignorado", action);
            return;
        }

        // Extraer external_reference del body
        @SuppressWarnings("unchecked")
        Map<String, Object> data = body != null ? (Map<String, Object>) body.get("data") : null;
        String externalRef = data != null ? (String) data.get("external_reference") : null;

        if (externalRef == null || !externalRef.startsWith("TABLE-")) {
            log.warn("External reference inválida: {}", externalRef);
            return;
        }

        // Parsear "TABLE-{tableId}-{tableNumber}"
        String[] parts = externalRef.split("-");
        if (parts.length < 3) {
            log.warn("External reference con formato incorrecto: {}", externalRef);
            return;
        }

        Integer tableNumber = Integer.parseInt(parts[2]);
        TableEntity table = tableRepository.findByNumber(tableNumber).orElse(null);

        if (table == null || table.getState() == MesaStatus.LIBRE) {
            log.info("Mesa {} ya estaba cerrada o no existe, ignorando webhook", tableNumber);
            return;
        }

        // Cerrar la mesa automáticamente
        CloseCashierRequestDto req = new CloseCashierRequestDto();
        req.setPaymentMethod(PaymentMethod.MERCADO_PAGO);
        req.setNotes("Pago QR Mercado Pago — order_id: " + orderId);

        cashierService.closeTable(table.getId(), req);
        log.info("Mesa {} cerrada automáticamente vía webhook MP (order: {})", tableNumber, orderId);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private TableEntity getTableOrThrow(Integer tableNumber) {
        return tableRepository.findByNumber(tableNumber)
                .orElseThrow(() -> new BusinessException("Mesa " + tableNumber + " no encontrada"));
    }

    private BigDecimal calcularSubtotal(List<OrderItemEntity> items) {
        return items.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private void validateSignature(String dataId, String xSignature, String xRequestId) {
        try {
            String ts = null, v1 = null;
            for (String part : xSignature.split(",")) {
                String[] kv = part.trim().split("=", 2);
                if (kv.length == 2) {
                    if ("ts".equals(kv[0])) ts = kv[1];
                    if ("v1".equals(kv[0])) v1 = kv[1];
                }
            }
            if (ts == null || v1 == null) throw new BusinessException("Firma MP incompleta");

            String manifest = "id:" + dataId + ";request-id:" + xRequestId + ";ts:" + ts + ";";
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(
                    webhookSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = java.util.HexFormat.of().formatHex(
                    mac.doFinal(manifest.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

            if (!computed.equals(v1)) throw new BusinessException("Firma MP inválida — posible request no auténtico");

        } catch (java.security.NoSuchAlgorithmException | java.security.InvalidKeyException e) {
            throw new BusinessException("Error validando firma MP: " + e.getMessage());
        }
    }
}
