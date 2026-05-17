package com.zipflow.zipflowserver.service;

import com.zipflow.zipflowserver.entities.UserEntity;
import com.zipflow.zipflowserver.model.AuthenticationResponse;
import com.zipflow.zipflowserver.model.LoginRequest;
import com.zipflow.zipflowserver.model.RegisterRequest;
import com.zipflow.zipflowserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = UserEntity.builder()
                .first_name(request.getFirst_name())
                .last_name(request.getLast_name())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            try {
                throw new Exception("Email address is already in use: " + request.getEmail());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        var jwtToken = jwtService.generateToken(user);

        userRepository.save(user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            var jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .build();
        }

        throw new IllegalStateException("Wrong password");
    }
}
