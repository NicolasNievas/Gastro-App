package com.example.gastro_app.services.imp;

import com.example.gastro_app.exceptions.BusinessException;
import com.example.gastro_app.exceptions.ResourceNotFoundException;
import com.example.gastro_app.dtos.request.CategoryRequestDto;
import com.example.gastro_app.dtos.response.CategoryResponseDto;
import com.example.gastro_app.entities.CategoryEntity;
import com.example.gastro_app.repositories.CategoryRepository;
import com.example.gastro_app.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponseDto> findAll() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::toDto).toList();
    }

    @Override
    public CategoryResponseDto findById(Long id) {
        return toDto(getOrThrow(id));
    }

    @Override
    public CategoryResponseDto create(CategoryRequestDto request) {
        if (categoryRepository.findByNameIgnoreCase(request.getName()).isPresent()){
            throw new BusinessException("Ya existe una categoría con el nombre: " + request.getName());
        }
        CategoryEntity category = CategoryEntity.builder()
                .name(request.getName().trim())
                .active(true)
                .build();
        return toDto(categoryRepository.save(category));
    }

    @Override
    public CategoryResponseDto update(Long id, CategoryRequestDto request) {
        CategoryEntity entity = getOrThrow(id);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new BusinessException("Ya existe otra categoría con el nombre: " + request.getName());
        }
        entity.setName(request.getName().trim());
        return toDto(categoryRepository.save(entity));
    }

    @Override
    public void deactivate(Long id) {
        CategoryEntity entity = getOrThrow(id);
        entity.setActive(false);
        categoryRepository.save(entity);
    }

    @Override
    public List<CategoryResponseDto> findAllIncludingInactive() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto).toList();
    }

    @Override
    public void activate(Long id) {
        CategoryEntity entity = getOrThrow(id);
        entity.setActive(true);
        categoryRepository.save(entity);
    }

    private CategoryEntity getOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    public CategoryResponseDto toDto(CategoryEntity e) {
        return CategoryResponseDto.builder()
                .id(e.getId()).name(e.getName())
                .active(e.getActive()).createdAt(e.getCreatedAt())
                .build();
    }
}
