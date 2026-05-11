package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.LanguageEntity;
import com.zipflow.zipflowserver.repository.LanguageRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
public class LanguageController {
    private final LanguageRepository languageRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLanguages() {
        List<LanguageEntity> languageEntities = languageRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("data", languageEntities);
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", (long) languageEntities.size());
        response.put("meta", meta);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LanguageEntity> getLanguageById(@PathVariable Long id) {
        Optional<LanguageEntity> languageEntity = languageRepository.findById(id);
        return languageEntity.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LanguageEntity> createLanguage(@Valid @RequestBody LanguageEntity languageEntity) {
        LanguageEntity savedLanguage = languageRepository.save(languageEntity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLanguage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LanguageEntity> updateLanguage(@PathVariable Long id,
                                                         @Valid @RequestBody LanguageEntity updatedLanguage) {
        if (!languageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedLanguage.setId(id);
        return ResponseEntity.ok(languageRepository.save(updatedLanguage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id) {
        if (!languageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        languageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
