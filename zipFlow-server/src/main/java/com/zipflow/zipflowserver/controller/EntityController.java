package com.zipflow.zipflowserver.controller;

import com.zipflow.zipflowserver.entities.DynamicEntity;
import com.zipflow.zipflowserver.model.ColumnDefinition;
import com.zipflow.zipflowserver.model.CrudEntityResponse;
import com.zipflow.zipflowserver.repository.EntityRepository;
import com.zipflow.zipflowserver.service.DynamicTableService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entities")
@RequiredArgsConstructor
public class EntityController {
    @PersistenceContext
    private EntityManager entityManager;

    private final EntityRepository entityRepository;
    private final DynamicTableService dynamicTableService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEntities(@RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "10") int rowsPerPage) {
        PageRequest pageable = PageRequest.of(page - 1, rowsPerPage);
        Page<DynamicEntity> pageResult = entityRepository.findAll(pageable);
        Map<String, Object> response = new HashMap<>();
        response.put("data", pageResult.getContent());
        Map<String, Long> meta = new HashMap<>();
        meta.put("total", pageResult.getTotalElements());
        response.put("meta", meta);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/crud")
    public ResponseEntity<List<CrudEntityResponse>> getAllCrudEntities() {
        List<DynamicEntity> entities = entityRepository.findAll();
        return ResponseEntity.ok(entities.stream().map(entity -> {
            CrudEntityResponse dto = new CrudEntityResponse();
            dto.setId(entity.getId());
            dto.setSlug(entity.getMain_details().getSlug());
            dto.setLabel(entity.getMain_details().getLabel());
            return dto;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public Optional<DynamicEntity> getEntityById(@PathVariable Long id) {
        return entityRepository.findById(id);
    }

    @PostMapping
    public ResponseEntity<DynamicEntity> createEntity(@RequestBody DynamicEntity newEntity) {
        DynamicEntity savedEntity = entityRepository.save(newEntity);
        List<ColumnDefinition> columnDefinitions = List.of(
                new ColumnDefinition("data", "JSONB"),
                new ColumnDefinition("created_at", "TIMESTAMP"),
                new ColumnDefinition("updated_at", "TIMESTAMP")
        );
        dynamicTableService.createOrUpdateTable(newEntity.getMain_details().getSlug(), columnDefinitions);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEntity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DynamicEntity> updateEntityById(@PathVariable Long id,
                                                          @RequestBody DynamicEntity updatedEntity) {
        updatedEntity.setId(id);
        return ResponseEntity.ok(entityRepository.save(updatedEntity));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<DynamicEntity> getEntityBySlug(@PathVariable String slug) {
        try {
            String sql = "SELECT * FROM dynamic_entity WHERE main_details ->> 'slug' = :slug";
            Query query = entityManager.createNativeQuery(sql, DynamicEntity.class);
            query.setParameter("slug", slug);
            DynamicEntity entity = (DynamicEntity) query.getSingleResult();
            return ResponseEntity.ok(entity);
        } catch (NoResultException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable Long id) {
        if (!entityRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        entityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
