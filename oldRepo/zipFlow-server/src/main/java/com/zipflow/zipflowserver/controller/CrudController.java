package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.service.DynamicTableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/crud")
public class CrudController {
    private DynamicTableService dynamicTableService;

    public CrudController(DynamicTableService dynamicTableService) {
        this.dynamicTableService = dynamicTableService;
    }

    @GetMapping("/{slug}")
    public Map<String, Object> getEntityBySlug(@PathVariable String slug,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "10") int rowsPerPage,
                                               @RequestParam(required = false) String search,
                                               @RequestParam(required = false) String filter,
                                               @RequestParam(required = false) String sortBy,
                                               @RequestParam(required = false) String sortOrder) {
        return dynamicTableService.getData(slug, page, rowsPerPage, search, filter, sortBy, sortOrder);
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
        // Update the data with the given slug and id
        Map<String, Object> updatedData = dynamicTableService.updateData(slug, id, data);

        // Optionally, you can return the updated data in the response
        return ResponseEntity.ok(updatedData);
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
