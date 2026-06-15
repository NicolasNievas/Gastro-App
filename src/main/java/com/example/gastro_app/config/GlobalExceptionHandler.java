package com.example.gastro_app.config;

import com.example.gastro_app.dtos.common.ErrorApi;
import com.example.gastro_app.dtos.exceptions.BusinessException;
import com.example.gastro_app.dtos.exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorApi> handleNotFound(ResourceNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorApi> handleBusiness(BusinessException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorApi> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorApi> handleAccess(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "No tenés permisos para realizar esta acción");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorApi> handleGeneral(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
    }

    private ResponseEntity<ErrorApi> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(ErrorApi.builder()
                .timestamp(LocalDateTime.now().toString())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .build());
    }
}
