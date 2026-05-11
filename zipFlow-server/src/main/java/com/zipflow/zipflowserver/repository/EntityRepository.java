package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.DynamicEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntityRepository extends JpaRepository<DynamicEntity, Long> {
}
