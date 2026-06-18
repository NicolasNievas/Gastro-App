package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.TableAdjustmentDto;
import com.example.gastro_app.dtos.request.TableRequestDto;
import com.example.gastro_app.dtos.response.TableResponseDto;
import com.example.gastro_app.entities.TableEntity;
import com.example.gastro_app.enums.MesaStatus;

import java.util.List;

public interface TableService {
    List<TableResponseDto> findAll();
    List<TableResponseDto> findOpen();
    TableResponseDto findById(Long id);
    TableResponseDto create(TableRequestDto req);
    TableResponseDto update(Long id, TableRequestDto req);
    TableResponseDto updateAdjustment(Long id, TableAdjustmentDto req);
    void delete(Long id);
    void open(Long tableId);
    void close(Long tableId);
    void syncState(Long tableId, MesaStatus newState);
}
