package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.CustomerOrderRequestDto;
import com.example.gastro_app.dtos.response.CustomerOrderResponseDto;
import com.example.gastro_app.dtos.response.MenuResponseDto;
import com.example.gastro_app.services.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    /**
     * El cliente escanea el QR → carga el menú de su mesa.
     */
    @GetMapping("/{tableNumber}")
    public ResponseEntity<MenuResponseDto> getMenu(@PathVariable Integer tableNumber) {
        return ResponseEntity.ok(menuService.getMenu(tableNumber));
    }

    /**
     * El cliente confirma su pedido desde el menú digital.
     */
    @PostMapping("/{tableNumber}/order")
    public ResponseEntity<CustomerOrderResponseDto> placeOrder(
            @PathVariable Integer tableNumber,
            @RequestBody @Valid CustomerOrderRequestDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.placeOrder(tableNumber, req));
    }
}
