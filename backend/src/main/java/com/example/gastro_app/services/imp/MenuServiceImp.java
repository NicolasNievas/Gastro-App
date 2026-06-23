package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.request.CreateOrderRequestDto;
import com.example.gastro_app.dtos.request.CustomerOrderRequestDto;
import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.entities.CategoryEntity;
import com.example.gastro_app.entities.TableEntity;
import com.example.gastro_app.entities.UserEntity;
import com.example.gastro_app.enums.MesaStatus;
import com.example.gastro_app.exceptions.BusinessException;
import com.example.gastro_app.exceptions.ResourceNotFoundException;
import com.example.gastro_app.repositories.CategoryRepository;
import com.example.gastro_app.repositories.ProductRepository;
import com.example.gastro_app.repositories.TableRepository;
import com.example.gastro_app.repositories.UserRepository;
import com.example.gastro_app.services.MenuService;
import com.example.gastro_app.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImp implements MenuService {

    private final TableRepository tableRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Override
    @Transactional(readOnly = true)
    public MenuResponseDto getMenu(Integer tableNumber) {
        TableEntity table = getTableOrThrow(tableNumber);

        // Traemos todas las categorías activas con sus productos activos
        List<CategoryEntity> categories = categoryRepository.findByActiveTrue();

        List<MenuCategoryDto> categoryDtos = categories.stream()
                .map(cat -> {
                    List<MenuProductDto> products = productRepository
                            .findWithFilters(true, null, cat.getId())
                            .stream()
                            .map(p -> MenuProductDto.builder()
                                    .id(p.getId())
                                    .name(p.getName())
                                    .price(p.getPrice())
                                    .sector(p.getSector().name())
                                    .available(!p.getNoStock() && p.getStock() > 0)
                                    .build())
                            .toList();

                    return MenuCategoryDto.builder()
                            .id(cat.getId())
                            .name(cat.getName())
                            .products(products)
                            .build();
                })
                // Solo incluir categorías que tengan al menos un producto
                .filter(cat -> !cat.getProducts().isEmpty())
                .toList();

        return MenuResponseDto.builder()
                .tableNumber(table.getNumber())
                .tableState(table.getState())
                .tableStateLabel(table.getState().getLabel())
                .categories(categoryDtos)
                .build();
    }

    @Override
    public CustomerOrderResponseDto placeOrder(Integer tableNumber, CustomerOrderRequestDto req) {
        TableEntity table = getTableOrThrow(tableNumber);

        UserEntity autoservicio = userRepository.findByUsername("autoservicio")
                .orElseThrow(() -> new BusinessException("Error de configuración del sistema"));

        CreateOrderRequestDto orderReq = CreateOrderRequestDto.builder()
                .tableId(table.getId())
                .note(req.getNote())
                .items(req.getItems())
                .build();

        OrderResponseDto order = orderService.createOrder(orderReq, "autoservicio");

        // Respuesta simplificada para el cliente
        List<CustomerOrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> CustomerOrderItemDto.builder()
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return CustomerOrderResponseDto.builder()
                .orderId(order.getId())
                .tableNumber(tableNumber)
                .message("¡Tu pedido fue enviado! Cocina y barra ya lo están preparando.")
                .items(itemDtos)
                .total(order.getTotal())
                .build();
    }

    private TableEntity getTableOrThrow(Integer tableNumber) {
        return tableRepository.findByNumber(tableNumber)
                .orElseThrow(() -> new BusinessException("Mesa " + tableNumber + " no encontrada"));
    }
}
