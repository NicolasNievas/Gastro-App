package com.example.gastro_app.controllers;

import com.example.gastro_app.dtos.request.TableAdjustmentDto;
import com.example.gastro_app.dtos.request.TableRequestDto;
import com.example.gastro_app.dtos.response.TableResponseDto;
import com.example.gastro_app.services.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @GetMapping
    public ResponseEntity<List<TableResponseDto>> findAll() {
        return ResponseEntity.ok(tableService.findAll());
    }

    @GetMapping("/open")
    public ResponseEntity<List<TableResponseDto>> findOpen() {
        return ResponseEntity.ok(tableService.findOpen());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TableResponseDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TableResponseDto> create(@RequestBody @Valid TableRequestDto req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tableService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TableResponseDto> update(@PathVariable Long id,
                                                   @RequestBody @Valid TableRequestDto req) {
        return ResponseEntity.ok(tableService.update(id, req));
    }

    @PatchMapping("/{id}/adjustment")
    @PreAuthorize("hasAnyRole('ADMIN', 'CAJA')")
    public ResponseEntity<TableResponseDto> updateAdjustment(@PathVariable Long id,
                                                             @RequestBody @Valid TableAdjustmentDto req) {
        return ResponseEntity.ok(tableService.updateAdjustment(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tableService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
