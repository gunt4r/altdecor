package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.EmailTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("emailTemplateRepository")
public interface EmailTemplateRepository extends JpaRepository<EmailTemplateEntity, Long> {
}
