package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.AnalyticsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEntity, Long> {
    List<AnalyticsEntity> findByActiveTrue();

    Optional<AnalyticsEntity> findByType(String type);
}
