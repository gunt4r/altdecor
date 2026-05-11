package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.CheckoutEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CheckoutRepository extends JpaRepository<CheckoutEntity, Long> {
}
