package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
public class ReportController {

    private final ReportService reportsService;

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryDto> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportsService.getSummary(from, to));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodSummaryDto>> getByPaymentMethod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportsService.getByPaymentMethod(from, to));
    }

    @GetMapping("/daily-revenue")
    public ResponseEntity<List<DailyRevenueDto>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportsService.getDailyRevenue(from, to));
    }

    @GetMapping("/hourly")
    public ResponseEntity<List<HourlySalesDto>> getHourlySales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportsService.getHourlySales(from, to));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductDto>> getTopProducts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reportsService.getTopProducts(from, to, limit));
    }
}
