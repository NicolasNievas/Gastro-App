package com.example.gastro_app.services;

import com.example.gastro_app.dtos.response.*;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    ReportSummaryDto getSummary          (LocalDate from, LocalDate to);
    List<PaymentMethodSummaryDto> getByPaymentMethod(LocalDate from, LocalDate to);
    List<DailyRevenueDto>      getDailyRevenue     (LocalDate from, LocalDate to);
    List<HourlySalesDto>       getHourlySales      (LocalDate from, LocalDate to);
    List<TopProductDto>        getTopProducts      (LocalDate from, LocalDate to, int limit);
}
