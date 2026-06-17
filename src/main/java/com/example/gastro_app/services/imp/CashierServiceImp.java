package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.exceptions.BusinessException;
import com.example.gastro_app.dtos.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.CloseCashierRequestDto;
import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.entities.*;
import com.example.gastro_app.enums.*;
import com.example.gastro_app.mappers.TableMapper;
import com.example.gastro_app.repositories.*;
import com.example.gastro_app.services.CashierService;
import com.example.gastro_app.services.OrderService;
import com.example.gastro_app.services.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CashierServiceImp implements CashierService {

    private final TableRepository tableRepository;
    private final TableService tableService;
    private final TableMapper tableMapper;
    private final OrderService orderService;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public BillResponseDto getBill(Long tableId) {
        TableEntity table = getOrThrow(tableId);

        if (table.getState() == MesaStatus.LIBRE){
            throw new BusinessException("La mesa está libre, no tiene cuenta abierta");
        }

        List<OrderItemEntity> items = orderService.getOpenItemsByTableId(tableId);
        if (items.isEmpty()) {
            throw new BusinessException("La mesa no tiene productos cargados");
        }

        return buildBill(table, items);
    }

    @Override
    public PaymentResponseDto closeTable(Long tableId, CloseCashierRequestDto req) {
        TableEntity table = getOrThrow(tableId);

        if (table.getState() == MesaStatus.LIBRE) {
            throw new BusinessException("La mesa ya está cerrada");
        }

        List<OrderItemEntity> items = orderService.getOpenItemsByTableId(tableId);
        if (items.isEmpty()) {
            throw new BusinessException("No se puede cobrar una mesa sin productos");
        }

        // Calcular totales — espejo de cashierDetail() en app.js
        BigDecimal subtotal  = calculateSubtotal(items);
        BigDecimal discount  = nvl(table.getDiscount());
        BigDecimal surcharge = nvl(table.getSurcharge());
        BigDecimal total     = subtotal.subtract(discount).add(surcharge).max(BigDecimal.ZERO);

        // Persistir pago (primero para tener el ID y linkearlo a las órdenes)
        PaymentEntity payment = paymentRepository.save(PaymentEntity.builder()
                .table(table)
                .method(req.getPaymentMethod())
                .subtotal(subtotal)
                .discount(discount)
                .surcharge(surcharge)
                .amount(total)
                .notes(req.getNotes())
                .build());

        // Descontar stock — espejo de decrementStock() en app.js
        decrementStock(items);

        // Cerrar pedidos y linkearlos al pago
        orderService.closeOrdersByTableId(tableId, payment);

        // Liberar mesa (resetea estado, openedAt, discount, surcharge + broadcast WS)
        tableService.close(tableId);

        return toPaymentDto(payment, items);
    }

    // ── GET /api/cashier/history ──────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PaymentSummaryDto> getHistory(Integer tableNumber, PaymentMethod method) {
        return paymentRepository.findWithFilters(tableNumber, method).stream()
                .map(p -> {
                    int count = orderItemRepository.findItemsByPaymentId(p.getId()).size();
                    return toSummaryDto(p, count);
                }).toList();
    }

    // ── GET /api/cashier/history/{id} ────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long id) {
        PaymentEntity payment = paymentRepository.findByIdWithTable(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago", id));

        List<OrderItemEntity> items = orderItemRepository.findItemsByPaymentId(id);
        return toPaymentDto(payment, items);
    }

    // ── Lógica interna ────────────────────────────────────────────────

    /**
     * Agrega cantidades por producto para evitar duplicados
     * y descuenta el stock. Espejo de decrementStock() en app.js.
     */
    private void decrementStock(List<OrderItemEntity> items) {
        Map<Long, Integer> totals = new LinkedHashMap<>();
        items.forEach(i -> totals.merge(i.getProduct().getId(), i.getQuantity(), Integer::sum));

        totals.forEach((productId, qty) -> {
            ProductEntity product = productRepository.findById(productId).orElse(null);
            if (product == null) return;

            int newStock = Math.max(0, product.getStock() - qty);
            product.setStock(newStock);
            product.setNoStock(newStock == 0);
            productRepository.save(product);

            stockMovementRepository.save(StockMovementEntity.builder()
                    .product(product)
                    .quantityChange(-qty)           // negativo = salida
                    .reason(StockMovementReason.SALE)
                    .build());
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private TableEntity getOrThrow(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa", id));
    }

    private BigDecimal calculateSubtotal(List<OrderItemEntity> items) {
        return items.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    // ── Mappers ───────────────────────────────────────────────────────

    private BillResponseDto buildBill(TableEntity table, List<OrderItemEntity> items) {
        BigDecimal subtotal  = calculateSubtotal(items);
        BigDecimal discount  = nvl(table.getDiscount());
        BigDecimal surcharge = nvl(table.getSurcharge());
        BigDecimal total     = subtotal.subtract(discount).add(surcharge).max(BigDecimal.ZERO);

        return BillResponseDto.builder()
                .tableId(table.getId())
                .tableNumber(table.getNumber())
                .tableState(table.getState())
                .tableStateLabel(table.getState().getLabel())
                .openedAt(table.getOpenedAt())
                .items(toItemDtos(items))
                .subtotal(subtotal)
                .discount(discount)
                .surcharge(surcharge)
                .total(total)
                .build();
    }

    private BillItemDto toItemDto(OrderItemEntity item) {
        BigDecimal price = item.getProduct().getPrice();
        int qty = item.getQuantity();
        return BillItemDto.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .unitPrice(price)
                .quantity(qty)
                .sector(item.getSector())
                .subtotal(price.multiply(BigDecimal.valueOf(qty)))
                .build();
    }

    private List<BillItemDto> toItemDtos(List<OrderItemEntity> items) {
        return items.stream().map(this::toItemDto).toList();
    }

    private PaymentResponseDto toPaymentDto(PaymentEntity p, List<OrderItemEntity> items) {
        return PaymentResponseDto.builder()
                .id(p.getId())
                .tableNumber(p.getTable().getNumber())
                .method(p.getMethod())
                .subtotal(p.getSubtotal())
                .discount(p.getDiscount())
                .surcharge(p.getSurcharge())
                .amount(p.getAmount())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .items(toItemDtos(items))
                .build();
    }

    private PaymentSummaryDto toSummaryDto(PaymentEntity p, int itemCount) {
        return PaymentSummaryDto.builder()
                .id(p.getId())
                .tableNumber(p.getTable().getNumber())
                .method(p.getMethod())
                .subtotal(p.getSubtotal())
                .discount(p.getDiscount())
                .surcharge(p.getSurcharge())
                .amount(p.getAmount())
                .createdAt(p.getCreatedAt())
                .itemCount(itemCount)
                .build();
    }
}
