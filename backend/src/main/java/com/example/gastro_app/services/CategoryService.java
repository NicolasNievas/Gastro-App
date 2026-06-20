package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.CategoryRequestDto;
import com.example.gastro_app.dtos.response.CategoryResponseDto;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDto> findAll();
    CategoryResponseDto findById(Long id);
    CategoryResponseDto create(CategoryRequestDto request);
    CategoryResponseDto update(Long id, CategoryRequestDto request);
    void deactivate(Long id);
    List<CategoryResponseDto> findAllIncludingInactive();
    void activate(Long id);
}
