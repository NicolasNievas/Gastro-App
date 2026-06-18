package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.RestockDto;
import com.example.gastro_app.dtos.request.StockAdjustmentDto;
import com.example.gastro_app.dtos.response.StockAlertDto;
import com.example.gastro_app.dtos.response.StockMovementResponseDto;
import com.example.gastro_app.dtos.response.StockStatusDto;
import com.example.gastro_app.enums.StockMovementReason;

import java.util.List;

public interface StockService {
    List<StockStatusDto> getAll();
    StockAlertDto getAlerts();
    StockStatusDto restock(Long productId, RestockDto req);
    StockStatusDto adjust(Long productId, StockAdjustmentDto req);
    List<StockMovementResponseDto> getMovements(Long productId, StockMovementReason reason);
}
