package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.LanguageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("languageRepository")
public interface LanguageRepository extends JpaRepository<LanguageEntity, Long> {
    List<LanguageEntity> findByActiveTrue();
}
