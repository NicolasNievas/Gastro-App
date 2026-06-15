package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.ProductRequestDto;
import com.example.gastro_app.dtos.response.ProductResponseDto;
import com.example.gastro_app.enums.Sector;

import java.util.List;

public interface ProductService {
    List<ProductResponseDto> findAll(Boolean active, Sector sector, Long categoryId);
    ProductResponseDto findById(Long id);
    ProductResponseDto create(ProductRequestDto req);
    ProductResponseDto update(Long id, ProductRequestDto req);
    void deactivate(Long id);
}
