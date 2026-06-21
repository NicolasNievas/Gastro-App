package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.CloseCashierRequestDto;
import com.example.gastro_app.dtos.response.*;
import com.example.gastro_app.enums.PaymentMethod;

import java.util.List;

public interface CashierService {
    BillResponseDto getBill(Long tableId);
    PaymentResponseDto closeTable(Long tableId, CloseCashierRequestDto req);
    List<PaymentSummaryDto> getHistory(Integer tableNumber, PaymentMethod method);
    PaymentResponseDto getPaymentById(Long id);
    TodaySummaryDto getTodaySummary();
    List<OpenTableSummaryDto> getOpenTablesSummary();
}
