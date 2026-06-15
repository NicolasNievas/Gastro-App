package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.ProductRequestDto;
import com.example.gastro_app.dtos.response.CategoryResponseDto;
import com.example.gastro_app.dtos.response.ProductResponseDto;
import com.example.gastro_app.entities.CategoryEntity;
import com.example.gastro_app.entities.ProductEntity;
import com.example.gastro_app.enums.Sector;
import com.example.gastro_app.repositories.CategoryRepository;
import com.example.gastro_app.repositories.ProductRepository;
import com.example.gastro_app.services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ProductResponseDto> findAll(Boolean active, Sector sector, Long categoryId) {
        return productRepository.findWithFilters(active, sector, categoryId).stream()
                .map(this::toDto).toList();
    }

    @Override
    public ProductResponseDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Override
    public ProductResponseDto create(ProductRequestDto req) {
        CategoryEntity category = getCategoryOrThrow(req.getCategoryId());
        ProductEntity entity = ProductEntity.builder()
                .name(req.getName().trim())
                .price(req.getPrice())
                .category(category)
                .sector(req.getSector())
                .stock(req.getStock())
                .lowStock(req.getLowStock() != null ? req.getLowStock() : 10)
                .noStock(req.getNoStock() != null ? req.getNoStock() : false)
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        // Si el stock inicial es 0, marcar sin stock automáticamente
        if (entity.getStock() == 0) entity.setNoStock(true);
        return toDto(productRepository.save(entity));
    }

    @Override
    public ProductResponseDto update(Long id, ProductRequestDto req) {
        ProductEntity entity = getOrThrow(id);
        entity.setName(req.getName().trim());
        entity.setPrice(req.getPrice());
        entity.setCategory(getCategoryOrThrow(req.getCategoryId()));
        entity.setSector(req.getSector());
        entity.setStock(req.getStock());
        if (req.getLowStock() != null)  entity.setLowStock(req.getLowStock());
        if (req.getNoStock() != null)   entity.setNoStock(req.getNoStock());
        if (req.getActive() != null)    entity.setActive(req.getActive());
        // Igual que en app.js: si stock llega a 0, marca sin stock
        if (entity.getStock() == 0) entity.setNoStock(true);
        return toDto(productRepository.save(entity));
    }

    @Override
    public void deactivate(Long id) {
        ProductEntity entity = getOrThrow(id);
        entity.setActive(false);
        productRepository.save(entity);
    }

    private ProductEntity getOrThrow(Long id) {
        return productRepository.findByIdWithCategory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    private CategoryEntity getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    public ProductResponseDto toDto(ProductEntity e) {
        CategoryEntity cat = e.getCategory();
        return ProductResponseDto.builder()
                .id(e.getId()).name(e.getName()).price(e.getPrice())
                .category(CategoryResponseDto.builder()
                        .id(cat.getId()).name(cat.getName())
                        .active(cat.getActive()).createdAt(cat.getCreatedAt())
                        .build())
                .sector(e.getSector())
                .stock(e.getStock()).lowStock(e.getLowStock()).noStock(e.getNoStock())
                .active(e.getActive())
                .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }
}
