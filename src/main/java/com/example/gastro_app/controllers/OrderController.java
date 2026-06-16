package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.CreateOrderRequestDto;
import com.example.gastro_app.dtos.response.OrderResponseDto;
import com.example.gastro_app.dtos.response.OrderSummaryDto;
import com.example.gastro_app.enums.OrderStatus;
import com.example.gastro_app.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<List<OrderSummaryDto>> findAll(
            @RequestParam(required = false) Long tableId,
            @RequestParam(required = false) OrderStatus state) {
        return ResponseEntity.ok(orderService.findAll(tableId, state));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MOZO', 'CAJA')")
    public ResponseEntity<OrderResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MOZO')")
    public ResponseEntity<OrderResponseDto> create(
            @RequestBody @Valid CreateOrderRequestDto req,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(req, auth.getName()));
    }
}
