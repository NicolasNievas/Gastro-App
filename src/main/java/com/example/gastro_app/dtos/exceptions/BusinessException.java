package com.example.gastro_app.dtos.exceptions;

public class BusinessException extends RuntimeException{
    public BusinessException(String message) {
        super(message);
    }
}
