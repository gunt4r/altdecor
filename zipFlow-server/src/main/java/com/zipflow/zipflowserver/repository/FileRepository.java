package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<FileEntity, Long> {
}
