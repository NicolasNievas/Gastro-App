package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.RestockDto;
import com.example.gastro_app.dtos.request.StockAdjustmentDto;
import com.example.gastro_app.dtos.response.StockAlertDto;
import com.example.gastro_app.dtos.response.StockMovementResponseDto;
import com.example.gastro_app.dtos.response.StockStatusDto;
import com.example.gastro_app.enums.StockMovementReason;
import com.example.gastro_app.services.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<List<StockStatusDto>> getAll() {
        return ResponseEntity.ok(stockService.getAll());
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA', 'MOZO')")
    public ResponseEntity<StockAlertDto> getAlerts() {
        return ResponseEntity.ok(stockService.getAlerts());
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<List<StockMovementResponseDto>> getMovements(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) StockMovementReason reason) {
        return ResponseEntity.ok(stockService.getMovements(productId, reason));
    }

    @PatchMapping("/{productId}/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<StockStatusDto> restock(
            @PathVariable Long productId,
            @RequestBody @Valid RestockDto req) {
        return ResponseEntity.ok(stockService.restock(productId, req));
    }

    @PatchMapping("/{productId}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StockStatusDto> adjust(
            @PathVariable Long productId,
            @RequestBody @Valid StockAdjustmentDto req) {
        return ResponseEntity.ok(stockService.adjust(productId, req));
    }
}
