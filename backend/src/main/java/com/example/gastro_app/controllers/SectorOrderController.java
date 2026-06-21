package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.UpdateSectorStatusDto;
import com.example.gastro_app.dtos.response.KdsSummaryDto;
import com.example.gastro_app.dtos.response.SectorOrderResponseDto;
import com.example.gastro_app.enums.Sector;
import com.example.gastro_app.services.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sector-orders")
@RequiredArgsConstructor
public class SectorOrderController {

    private final OrderService orderService;

    // Pantalla KDS cocina: GET /api/sector-orders/active?sector=COCINA
    // Pantalla KDS barra:  GET /api/sector-orders/active?sector=BARRA
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'COCINA', 'BARRA')")
    public ResponseEntity<List<SectorOrderResponseDto>> findActive(@RequestParam Sector sector) {
        return ResponseEntity.ok(orderService.findActiveSectorOrders(sector));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COCINA', 'BARRA')")
    public ResponseEntity<SectorOrderResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateSectorStatusDto req) {
        return ResponseEntity.ok(orderService.updateSectorStatus(id, req));
    }

    @GetMapping("/summary")
    public ResponseEntity<KdsSummaryDto> getSummary() {
        return ResponseEntity.ok(orderService.getSummary());
    }
}
