package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.LanguageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LanguageRepository extends JpaRepository<LanguageEntity, Long> {
    List<LanguageEntity> findByActiveTrue();
}
