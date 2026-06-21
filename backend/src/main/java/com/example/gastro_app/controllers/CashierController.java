package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.CloseCashierRequestDto;
import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.enums.PaymentMethod;
import com.example.gastro_app.services.CashierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cashier")
@RequiredArgsConstructor
public class CashierController {

    private final CashierService cashierService;

    // Vista previa de la cuenta — lo que ve la pantalla de caja antes de cobrar
    @GetMapping("/bill/{tableId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<BillResponseDto> getBill(@PathVariable Long tableId) {
        return ResponseEntity.ok(cashierService.getBill(tableId));
    }

    // Cobrar y cerrar mesa — el botón "Cobrar, generar ticket y cerrar mesa" del app.js
    @PostMapping("/close/{tableId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<PaymentResponseDto> closeTable(
            @PathVariable Long tableId,
            @RequestBody @Valid CloseCashierRequestDto req) {
        return ResponseEntity.ok(cashierService.closeTable(tableId, req));
    }

    // Historial de ventas — espejo de renderHistory() en app.js
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<List<PaymentSummaryDto>> getHistory(
            @RequestParam(required = false) Integer tableNumber,
            @RequestParam(required = false) PaymentMethod method) {
        return ResponseEntity.ok(cashierService.getHistory(tableNumber, method));
    }

    // Ticket completo de un pago — para "Ver ticket" en el historial
    @GetMapping("/history/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<PaymentResponseDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(cashierService.getPaymentById(id));
    }

    @GetMapping("/summary/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<TodaySummaryDto> getTodaySummary() {
        return ResponseEntity.ok(cashierService.getTodaySummary());
    }

    @GetMapping("/open-tables-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<List<OpenTableSummaryDto>> getOpenTablesSummary() {
        return ResponseEntity.ok(cashierService.getOpenTablesSummary());
    }
}
