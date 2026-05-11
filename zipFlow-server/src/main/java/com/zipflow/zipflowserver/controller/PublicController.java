package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.AnalyticsEntity;
import com.zipflow.zipflowserver.entities.LanguageEntity;
import com.zipflow.zipflowserver.repository.AnalyticsRepository;
import com.zipflow.zipflowserver.repository.LanguageRepository;
import com.zipflow.zipflowserver.service.DynamicTableService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final DynamicTableService dynamicTableService;
    private final LanguageRepository languageRepository;
    private final AnalyticsRepository analyticsRepository;

    @Value("${app.public.enforce-permissions:true}")
    private boolean enforcePublicPermissions;

    @Autowired
    public PublicController(DynamicTableService dynamicTableService, LanguageRepository languageRepository, AnalyticsRepository analyticsRepository) {
        this.dynamicTableService = dynamicTableService;
        this.languageRepository = languageRepository;
        this.analyticsRepository = analyticsRepository;
    }

    @GetMapping("/crud/{slug}")
    public Map<String, Object> getEntityBySlug(@PathVariable String slug,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int rowsPerPage,
                                               @RequestParam(required = false) String search,
                                               @RequestParam(required = false) String filter,
                                               @RequestParam(required = false) String sortBy,
                                               @RequestParam(required = false) String sortOrder) {
        ensurePublicGetAccess(slug);
        return dynamicTableService.getData(slug, page, rowsPerPage, search, filter, sortBy, sortOrder);
    }

    @GetMapping("/crud/{slug}/filter-labels")
    public List<Map<String, Object>> getEntityFilterLabelsBySlug(@PathVariable String slug,
                                                                 @RequestParam(required = false) String labels) {
        ensurePublicGetAccess(slug);
        return dynamicTableService.extractElementsWithLabels(slug, List.of(labels.split(",")));
    }

    @PostMapping("/crud/{slug}")
    public Map<String, Object> createByEntitySlug(@PathVariable String slug,
                                                  @RequestBody Map<String, Object> data) {
        boolean isPublic = dynamicTableService.isEntityPublicPost(slug);

        if (isPublic) {
            return dynamicTableService.saveData(slug, data);
        } else {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Route cannot be accessed!");
        }
    }

    @GetMapping("/crud/{slug}/{id}")
    public Map<String, Object> getDataById(@PathVariable String slug, @PathVariable Long id) {
        ensurePublicGetAccess(slug);
        return dynamicTableService.getDataById(slug, id);
    }

    @GetMapping("/analytics")
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

    @GetMapping("/languages")
    public ResponseEntity<Map<String, Object>> getAllLanguages() {
        List<LanguageEntity> languageEntities = languageRepository.findByActiveTrue();

        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("data", languageEntities);

        // Create meta map
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", (long) languageEntities.size());
        response.put("meta", meta);

        return ResponseEntity.ok(response);
    }

    private void ensurePublicGetAccess(String slug) {
        if (!enforcePublicPermissions) {
            return;
        }

        boolean isPublic = dynamicTableService.isEntityPublicGet(slug);
        if (!isPublic) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Route cannot be accessed!");
        }
    }
}
