package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.exceptions.BusinessException;
import com.example.gastro_app.dtos.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.CreateOrderRequestDto;
import com.example.gastro_app.dtos.request.OrderItemRequestDto;
import com.example.gastro_app.dtos.request.UpdateSectorStatusDto;
import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.entities.*;
import com.example.gastro_app.enums.*;
import com.example.gastro_app.mappers.TableMapper;
import com.example.gastro_app.repositories.*;
import com.example.gastro_app.services.OrderService;
import com.example.gastro_app.services.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImp implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final SectorOrderRepository sectorOrderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TableService tableService;
    private final TableRepository tableRepository;
    private final TableMapper tableMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<OrderSummaryDto> findAll(Long tableId, OrderStatus state) {
        return orderRepository.findWithFilters(tableId, state).stream()
                .map(this::toSummaryDto).toList();
    }

    @Override
    public OrderResponseDto findById(Long id) {
        OrderEntity order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido", id));
        List<SectorOrderEntity> sectorOrders = sectorOrderRepository.findByOrderId(id);
        return toDto(order, sectorOrders);
    }

    @Override
    public List<SectorOrderResponseDto> findActiveSectorOrders(Sector sector) {
        return sectorOrderRepository.findActiveBySector(sector).stream()
                .map(so -> {
                    List<OrderItemEntity> items = orderItemRepository
                            .findByOrderIdAndSector(so.getOrder().getId(), sector);
                    return toKdsDto(so, items);
                }).toList();
    }

    @Override
    public OrderResponseDto createOrder(CreateOrderRequestDto req, String waiterUsername) {
        // 1. Validar mesa y mozo
        TableEntity table = tableRepository.findById(req.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa", req.getTableId()));

        UserEntity waiter = userRepository.findByUsername(waiterUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + waiterUsername));

        // 3. Validar productos y construir items
        //    Espejo de las validaciones en sendOrder() + isUnavailable() + hasStockFor()
        List<OrderItemEntity> itemEntities = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequestDto itemReq : req.getItems()){
            ProductEntity product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", itemReq.getProductId()));

            if (!product.getActive()) {
                throw new BusinessException("'" + product.getName() + "' no está disponible");
            }
            if (product.getNoStock() || product.getStock() == 0) {
                throw new BusinessException("Sin stock: " + product.getName());
            }
            if (product.getStock() < itemReq.getQuantity()) {
                throw new BusinessException("Stock insuficiente de '" + product.getName()
                        + "' (disponible: " + product.getStock() + ")");
            }

            itemEntities.add(OrderItemEntity.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .notes(itemReq.getNotes())
                    .sector(product.getSector())
                    .state(OrderItemStatus.PENDIENTE)
                    .build());

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        // 4. Persistir la orden
        OrderEntity order = orderRepository.save(OrderEntity.builder()
                .table(table)
                .waiter(waiter)
                .state(OrderStatus.ABIERTO)
                .total(total)
                .note(req.getNote() != null ? req.getNote().trim() : null)
                .build());

        // 5. Persistir items
        itemEntities.forEach(item -> item.setOrder(order));
        List<OrderItemEntity> savedItems = orderItemRepository.saveAll(itemEntities);
        order.setItems(savedItems);

        // 6. Crear sector orders + broadcast a cocina/barra
        List<SectorOrderEntity> savedSectorOrders = new ArrayList<>();
        for (Sector sector : List.of(Sector.COCINA, Sector.BARRA)) {
            List<OrderItemEntity> sectorItems = savedItems.stream()
                    .filter(i -> i.getSector() == sector).toList();
            if (sectorItems.isEmpty()) continue;

            SectorOrderEntity so = sectorOrderRepository.save(
                    SectorOrderEntity.builder()
                            .order(order)
                            .sector(sector)
                            .status(SectorOrderStatus.PENDIENTE)
                            .build());
            savedSectorOrders.add(so);

            // Broadcast → cocina o barra recibe la nueva comanda en tiempo real
            messagingTemplate.convertAndSend(
                    "/topic/orders",
                    WsEventDto.of(WsEventType.ORDER_CREATED, toKdsDto(so, sectorItems)));
        }

        // 7. Abrir mesa — espejo de table.status = "esperando_pedido" + table.openedAt ||= new Date()
        tableService.open(req.getTableId());

        return toDto(order, savedSectorOrders);
    }

    // ── Actualización de estado KDS ───────────────────────────────────

    /**
     * Espejo de updateSectorStatus() + syncTableStatus() en app.js
     */
    @Override
    public SectorOrderResponseDto updateSectorStatus(Long sectorOrderId, UpdateSectorStatusDto req) {
        SectorOrderEntity sectorOrder = sectorOrderRepository.findById(sectorOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sector order", sectorOrderId));

        sectorOrder.setStatus(req.getStatus());
        sectorOrderRepository.save(sectorOrder);

        // syncTableStatus — recalcula el estado de la mesa mirando TODOS sus sector orders abiertos
        syncTableStatus(sectorOrder.getOrder().getTable().getId());

        List<OrderItemEntity> items = orderItemRepository.findByOrderIdAndSector(
                sectorOrder.getOrder().getId(), sectorOrder.getSector());

        SectorOrderResponseDto result = toKdsDto(sectorOrder, items);

        messagingTemplate.convertAndSend(
                "/topic/orders",
                WsEventDto.of(WsEventType.SECTOR_STATUS_UPDATED, result));

        return result;
    }

    /**
     * Espejo de syncTableStatus() en app.js.
     * Considera todos los sector orders de todos los pedidos abiertos de la mesa.
     */
    private void syncTableStatus(Long tableId) {
        List<SectorOrderEntity> all = sectorOrderRepository.findOpenByTableId(tableId);
        if (all.isEmpty()) return;

        MesaStatus newState;
        if (all.stream().allMatch(so -> so.getStatus() == SectorOrderStatus.ENTREGADO)) {
            newState = MesaStatus.PARA_COBRAR;
        } else if (all.stream().anyMatch(so -> so.getStatus() == SectorOrderStatus.LISTO)) {
            newState = MesaStatus.LISTA;
        } else if (all.stream().anyMatch(so -> so.getStatus() == SectorOrderStatus.EN_PREPARACION)) {
            newState = MesaStatus.EN_PREPARACION;
        } else {
            newState = MesaStatus.ESPERANDO_PEDIDO;
        }

        tableService.syncState(tableId, newState);
    }

    // ── Métodos internos para CashierService (Módulo 6) ──────────────

    public List<OrderItemEntity> getOpenItemsByTableId(Long tableId) {
        return orderItemRepository.findByTableIdAndOrderState(tableId, OrderStatus.ABIERTO);
    }

    public void closeOrdersByTableId(Long tableId) {
        List<OrderEntity> open = orderRepository.findByTable_IdAndState(tableId, OrderStatus.ABIERTO);
        open.forEach(o -> {
            o.setState(OrderStatus.CERRADO);
            o.setClosedAt(LocalDateTime.now());
        });
        orderRepository.saveAll(open);
    }

    // ── Mappers ───────────────────────────────────────────────────────

    private OrderItemResponseDto toItemDto(OrderItemEntity e) {
        return OrderItemResponseDto.builder()
                .id(e.getId())
                .productId(e.getProduct().getId())
                .productName(e.getProduct().getName())
                .price(e.getProduct().getPrice())
                .quantity(e.getQuantity())
                .notes(e.getNotes())
                .sector(e.getSector())
                .state(e.getState())
                .build();
    }

    public SectorOrderResponseDto toKdsDto(SectorOrderEntity so, List<OrderItemEntity> items) {
        return SectorOrderResponseDto.builder()
                .id(so.getId())
                .orderId(so.getOrder().getId())
                .tableNumber(so.getOrder().getTable().getNumber())
                .sector(so.getSector())
                .status(so.getStatus())
                .statusLabel(so.getStatus().getLabel())
                .orderNote(so.getOrder().getNote())
                .createdAt(so.getCreatedAt())
                .items(items.stream().map(this::toItemDto).toList())
                .build();
    }

    public OrderResponseDto toDto(OrderEntity o, List<SectorOrderEntity> sectorOrders) {
        return OrderResponseDto.builder()
                .id(o.getId())
                .table(tableMapper.toDto(o.getTable()))
                .waiterUsername(o.getWaiter().getUsername())
                .state(o.getState())
                .total(o.getTotal())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .closedAt(o.getClosedAt())
                .items(o.getItems().stream().map(this::toItemDto).toList())
                .sectorOrders(sectorOrders.stream().map(so -> {
                    List<OrderItemEntity> items = o.getItems().stream()
                            .filter(i -> i.getSector() == so.getSector()).toList();
                    return toKdsDto(so, items);
                }).toList())
                .build();
    }

    private OrderSummaryDto toSummaryDto(OrderEntity o){
        return OrderSummaryDto.builder()
                .id(o.getId())
                .tableNumber(o.getTable().getNumber())
                .state(o.getState())
                .total(o.getTotal())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
