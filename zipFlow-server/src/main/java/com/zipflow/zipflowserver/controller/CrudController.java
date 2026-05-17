package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.service.DynamicTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crud")
@RequiredArgsConstructor
public class CrudController {
    private final DynamicTableService dynamicTableService;

    @GetMapping("/{slug}")
    public Map<String, Object> getEntityBySlug(@PathVariable String slug,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int rowsPerPage,
                                               @RequestParam(required = false) String search,
                                               @RequestParam(required = false) String query,
                                               @RequestParam(required = false) String filter,
                                               @RequestParam(required = false) String sortBy,
                                               @RequestParam(required = false) String sortOrder) {
        String rawQuery = (search != null && !search.isEmpty()) ? search
                        : (query != null && !query.isEmpty()) ? query : null;
        String effectiveSearch = null;
        if (rawQuery != null) {
            if (rawQuery.contains("_contains_") || rawQuery.contains("_equals_")) {
                effectiveSearch = rawQuery;
            } else {
                effectiveSearch = "title_contains_" + rawQuery
                        + "_or_label_contains_" + rawQuery
                        + "_or_name_contains_" + rawQuery
                        + "_or_sku_contains_" + rawQuery
                        + "_or_model_contains_" + rawQuery;
            }
        }
        return dynamicTableService.getData(slug, page, rowsPerPage, effectiveSearch, filter, sortBy, sortOrder);
    }

    @PostMapping("/{slug}")
    public Map<String, Object> createByEntitySlug(@PathVariable String slug,
                                                  @RequestBody Map<String, Object> data) {
        return dynamicTableService.saveData(slug, data);
    }

    @PutMapping("/{slug}/{id}")
    public ResponseEntity<Map<String, Object>> updateDataBySlugAndId(@PathVariable String slug,
                                                                     @PathVariable Long id,
                                                                     @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(dynamicTableService.updateData(slug, id, data));
    }

    @GetMapping("/{slug}/{id}")
    public Map<String, Object> getDataById(@PathVariable String slug, @PathVariable Long id) {
        return dynamicTableService.getDataById(slug, id);
    }

    @DeleteMapping("/{slug}/{id}")
    public void deleteCrud(@PathVariable String slug, @PathVariable Long id) {
        dynamicTableService.deleteDataById(slug, id);
    }
}
