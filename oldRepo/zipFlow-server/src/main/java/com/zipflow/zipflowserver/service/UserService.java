package com.zipflow.zipflowserver.service;

import com.zipflow.zipflowserver.entities.UserEntity;
import com.zipflow.zipflowserver.model.RegisterRequest;
import com.zipflow.zipflowserver.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity findById(Long userId) {
        try {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("UserEntity not found with ID: " + userId));
        } catch (EntityNotFoundException e) {
            LOGGER.warn("UserEntity with ID {} not found", userId);
            throw e;
        } catch (Exception e) {
            LOGGER.error("An error occurred while retrieving data. Exception: ", e);
            throw e;
        }
    }

    public UserEntity createUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            try {
                throw new Exception("Email address is already in use: " + request.getEmail());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        var user = UserEntity.builder()
                .first_name(request.getFirst_name())
                .last_name(request.getLast_name())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);
        return user;
    }

    public void deleteUser(Long userId) {
        try {
            Optional<UserEntity> optionalUserEntity = userRepository.findById(userId);

            if (optionalUserEntity.isPresent()) {
                userRepository.deleteById(userId);
            } else {
                LOGGER.warn("UserEntity with ID {} not found", userId);
                throw new EntityNotFoundException("UserEntity not found with ID: " + userId);
            }
        } catch (Exception e) {
            LOGGER.error("An error occurred while deleting data. Exception: ", e);
        }
    }
}
