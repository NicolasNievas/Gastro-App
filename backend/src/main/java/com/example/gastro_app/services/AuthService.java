package com.example.gastro_app.services;

import com.example.gastro_app.dtos.request.LoginRequest;
import com.example.gastro_app.dtos.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
