package com.example.gastro_app.services.imp;

import com.example.gastro_app.exceptions.BusinessException;
import com.example.gastro_app.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.RestockDto;
import com.example.gastro_app.dtos.request.StockAdjustmentDto;
import com.example.gastro_app.dtos.response.StockAlertDto;
import com.example.gastro_app.dtos.response.StockMovementResponseDto;
import com.example.gastro_app.dtos.response.StockStatusDto;
import com.example.gastro_app.entities.ProductEntity;
import com.example.gastro_app.entities.StockMovementEntity;
import com.example.gastro_app.enums.StockMovementReason;
import com.example.gastro_app.repositories.ProductRepository;
import com.example.gastro_app.repositories.StockMovementRepository;
import com.example.gastro_app.services.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImp implements StockService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StockStatusDto> getAll() {
        return productRepository.findAllActiveWithCategory().stream()
                .map(this::toStockStatusDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StockAlertDto getAlerts() {
        return StockAlertDto.builder()
                .lowStock(productRepository.findLowStockProducts().stream()
                        .map(this::toStockStatusDto).toList())
                .outOfStock(productRepository.findOutOfStockProducts().stream()
                        .map(this::toStockStatusDto).toList())
                .build();
    }

    @Override
    public StockStatusDto restock(Long productId, RestockDto req) {
        ProductEntity product = getOrThrow(productId);

        int newStock = product.getStock() + req.getQuantity();
        product.setStock(newStock);
        product.setNoStock(false);   // reponer implica disponibilidad
        productRepository.save(product);

        saveMovement(product, req.getQuantity(), StockMovementReason.RESTOCK, req.getNotes());
        return toStockStatusDto(product);
    }

    @Override
    public StockStatusDto adjust(Long productId, StockAdjustmentDto req) {
        if (req.getQuantity() == 0) {
            throw new BusinessException("La cantidad del ajuste no puede ser cero");
        }
        if (req.getReason() == StockMovementReason.SALE ||
                req.getReason() == StockMovementReason.CANCELLED_ORDER) {
            throw new BusinessException("Motivo no permitido para ajuste manual: " + req.getReason());
        }

        ProductEntity product = getOrThrow(productId);

        int newStock = product.getStock() + req.getQuantity();
        if (newStock < 0) {
            throw new BusinessException(
                    "Stock insuficiente: ajuste de " + req.getQuantity()
                            + " dejaría el stock en " + newStock + " para '" + product.getName() + "'");
        }

        product.setStock(newStock);
        product.setNoStock(newStock == 0);
        productRepository.save(product);

        saveMovement(product, req.getQuantity(), req.getReason(), req.getNotes());
        return toStockStatusDto(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementResponseDto> getMovements(Long productId, StockMovementReason reason) {
        return stockMovementRepository.findWithFilters(productId, reason).stream()
                .map(this::toMovementDto).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private ProductEntity getOrThrow(Long id) {
        return productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    private void saveMovement(ProductEntity product, int quantity,
                              StockMovementReason reason, String notes) {
        stockMovementRepository.save(StockMovementEntity.builder()
                .product(product)
                .quantityChange(quantity)
                .reason(reason)
                .build());
    }

    // ── Mappers ───────────────────────────────────────────────────────

    private StockStatusDto toStockStatusDto(ProductEntity p) {
        String status;
        String label;
        if (p.getNoStock() || p.getStock() == 0) {
            status = "EMPTY"; label = "Sin stock";
        } else if (p.getStock() <= p.getLowStock()) {
            status = "LOW";   label = "Stock bajo";
        } else {
            status = "OK";    label = "Disponible";
        }
        return StockStatusDto.builder()
                .productId(p.getId())
                .productName(p.getName())
                .categoryName(p.getCategory().getName())
                .sector(p.getSector())
                .stock(p.getStock())
                .lowStock(p.getLowStock())
                .noStock(p.getNoStock())
                .status(status)
                .statusLabel(label)
                .build();
    }

    private StockMovementResponseDto toMovementDto(StockMovementEntity sm) {
        return StockMovementResponseDto.builder()
                .id(sm.getId())
                .productId(sm.getProduct().getId())
                .productName(sm.getProduct().getName())
                .quantityChange(sm.getQuantityChange())
                .reason(sm.getReason())
                .reasonLabel(sm.getReason().getLabel())
                .createdAt(sm.getCreatedAt())
                .build();
    }
}
