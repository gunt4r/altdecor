package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.EmailTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplateEntity, Long> {
}
