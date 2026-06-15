package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.exceptions.BusinessException;
import com.example.gastro_app.dtos.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.TableAdjustmentDto;
import com.example.gastro_app.dtos.request.TableRequestDto;
import com.example.gastro_app.dtos.response.TableResponseDto;
import com.example.gastro_app.entities.TableEntity;
import com.example.gastro_app.enums.MesaStatus;
import com.example.gastro_app.repositories.TableRepository;
import com.example.gastro_app.services.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TableServiceImp implements TableService {

    private final TableRepository tableRepository;

    @Override
    public List<TableResponseDto> findAll() {
        return tableRepository.findAllByOrderByNumberAsc().stream()
                .map(this::toDto).toList();
    }

    @Override
    public List<TableResponseDto> findOpen() {
        return tableRepository.findByStateNotOrderByNumberAsc(MesaStatus.LIBRE).stream()
                .map(this::toDto).toList();
    }

    @Override
    public TableResponseDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Override
    public TableResponseDto create(TableRequestDto req) {
        if (tableRepository.existsByNumber(req.getNumber())) {
            throw new BusinessException("Ya existe la mesa número " + req.getNumber());
        }
        TableEntity entity = TableEntity.builder()
                .number(req.getNumber())
                .capacity(req.getCapacity())
                .state(MesaStatus.LIBRE)
                .discount(BigDecimal.ZERO)
                .surcharge(BigDecimal.ZERO)
                .build();
        return toDto(tableRepository.save(entity));
    }

    @Override
    public TableResponseDto update(Long id, TableRequestDto req) {
        TableEntity entity = getOrThrow(id);
        if (tableRepository.existsByNumberAndIdNot(req.getNumber(), id)) {
            throw new BusinessException("Ya existe otra mesa con el número " + req.getNumber());
        }
        entity.setNumber(req.getNumber());
        entity.setCapacity(req.getCapacity());
        return toDto(tableRepository.save(entity));
    }

    @Override
    public TableResponseDto updateAdjustment(Long id, TableAdjustmentDto req) {
        TableEntity entity = getOrThrow(id);
        if (entity.getState() == MesaStatus.LIBRE) {
            throw new BusinessException("No se puede aplicar descuento/recargo a una mesa libre");
        }
        entity.setDiscount(req.getDiscount());
        entity.setSurcharge(req.getSurcharge());
        return toDto(tableRepository.save(entity));
    }

    @Override
    public void delete(Long id) {
        TableEntity entity = getOrThrow(id);
        if (entity.getState() != MesaStatus.LIBRE) {
            throw new BusinessException("Solo se pueden eliminar mesas en estado Libre");
        }
        tableRepository.delete(entity);
    }

    // ── Métodos internos — llamados por OrderService y CashierService ─

    /**
     * Abre la mesa al recibir el primer pedido.
     * Espejo de: table.status = "esperando_pedido" + table.openedAt ||= new Date()
     */
    public void open(Long tableId) {
        TableEntity table = getOrThrow(tableId);
        if (table.getOpenedAt() == null) {
            table.setOpenedAt(LocalDateTime.now());
        }
        table.setState(MesaStatus.ESPERANDO_PEDIDO);
        tableRepository.save(table);
    }

    /**
     * Cierra la mesa al cobrar.
     * Espejo de: table.status = "libre" + openedAt/discount/surcharge = null/0/0
     */
    public void close(Long tableId) {
        TableEntity table = getOrThrow(tableId);
        table.setState(MesaStatus.LIBRE);
        table.setOpenedAt(null);
        table.setDiscount(BigDecimal.ZERO);
        table.setSurcharge(BigDecimal.ZERO);
        tableRepository.save(table);
    }

    /**
     * Recalcula el estado según los estados de los sector-orders.
     * Espejo de syncTableStatus() en app.js — la lógica vive en OrderService,
     * que computa el nuevo estado y se lo pasa a este método.
     */
    public void syncState(Long tableId, MesaStatus newState) {
        TableEntity table = getOrThrow(tableId);
        table.setState(newState);
        tableRepository.save(table);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    public TableEntity getOrThrow(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa", id));
    }

    public TableResponseDto toDto(TableEntity e) {
        return TableResponseDto.builder()
                .id(e.getId())
                .number(e.getNumber())
                .capacity(e.getCapacity())
                .state(e.getState())
                .stateLabel(e.getState().getLabel())
                .openedAt(e.getOpenedAt())
                .discount(e.getDiscount())
                .surcharge(e.getSurcharge())
                .build();
    }
}
