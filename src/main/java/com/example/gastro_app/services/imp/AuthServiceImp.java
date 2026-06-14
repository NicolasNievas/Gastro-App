package com.example.gastro_app.services.imp;

import com.example.gastro_app.dtos.request.LoginRequest;
import com.example.gastro_app.dtos.response.AuthResponse;
import com.example.gastro_app.entities.UserEntity;
import com.example.gastro_app.jwt.JwtService;
import com.example.gastro_app.repositories.UserRepository;
import com.example.gastro_app.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
