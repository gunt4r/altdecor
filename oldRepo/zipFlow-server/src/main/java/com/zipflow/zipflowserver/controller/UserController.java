package com.zipflow.zipflowserver.controller;


import com.zipflow.zipflowserver.entities.UserEntity;
import com.zipflow.zipflowserver.model.RegisterRequest;
import com.zipflow.zipflowserver.repository.UserRepository;
import com.zipflow.zipflowserver.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(@RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "10") int rowsPerPage) {
        // Adjust page index
        int pageIndex = page - 1;

        // Retrieve paginated entities from the database
        Pageable pageable = PageRequest.of(pageIndex, rowsPerPage);
        Page<UserEntity> pageResult = userRepository.findAll(pageable);


        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("data", pageResult.getContent());

        // Create meta map
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", pageResult.getTotalElements());
        response.put("meta", meta);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable Long id) {
        try {
            UserEntity user = userService.findById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PostMapping()
    public ResponseEntity<UserEntity> createUser(@RequestBody RegisterRequest request) {
        if (request == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            UserEntity user = userService.createUser(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @DeleteMapping("/{id}")
    public String deleteFile(@PathVariable Long id) {
        if (id == null) {
            return "Invalid user ID. Please provide a valid user ID.";
        }

        try {
            userService.deleteUser(id);
            return "User with ID " + id + " deleted successfully.";
        } catch (Exception e) {
            return String.valueOf(e.getMessage());
        }
    }
}
