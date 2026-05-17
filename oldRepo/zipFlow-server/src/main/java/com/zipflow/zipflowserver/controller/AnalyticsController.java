package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.AnalyticsEntity;
import com.zipflow.zipflowserver.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsRepository analyticsRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAnalytics() {
        List<AnalyticsEntity> analyticsEntities = analyticsRepository.findAll();

        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("data", analyticsEntities);

        // Create meta map
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", (long) analyticsEntities.size());
        response.put("meta", meta);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnalyticsEntity> getAnalyticsById(@PathVariable Long id) {
        Optional<AnalyticsEntity> analyticsEntity = analyticsRepository.findById(id);
        return analyticsEntity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{type}")
    public ResponseEntity<Optional<AnalyticsEntity>> getAnalyticsByType(@PathVariable String type) {
        Optional<AnalyticsEntity> analytics = analyticsRepository.findByType(type);

        if (analytics.isPresent()) return ResponseEntity.ok(analytics);
        else return ResponseEntity.notFound().build();
    }


    @PostMapping
    public ResponseEntity<AnalyticsEntity> createAnalytics(@Valid @RequestBody AnalyticsEntity analyticsEntity) {
        AnalyticsEntity savedAnalytics = analyticsRepository.save(analyticsEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAnalytics);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnalyticsEntity> updateAnalytics(@PathVariable Long id, @Valid @RequestBody AnalyticsEntity updatedAnalytics) {
        if (!analyticsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        updatedAnalytics.setId(id);
        AnalyticsEntity savedAnalytics = analyticsRepository.save(updatedAnalytics);
        return ResponseEntity.ok(savedAnalytics);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalytics(@PathVariable Long id) {
        if (!analyticsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        analyticsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
