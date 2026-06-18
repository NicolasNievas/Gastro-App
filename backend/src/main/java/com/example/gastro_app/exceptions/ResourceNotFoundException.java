package com.example.gastro_app.exceptions;

public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " con id " + id + " no encontrado/a");
    }
}
