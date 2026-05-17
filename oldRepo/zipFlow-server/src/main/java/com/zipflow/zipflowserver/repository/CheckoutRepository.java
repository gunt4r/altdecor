package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.CheckoutEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("checkoutRepository")
public interface CheckoutRepository extends JpaRepository<CheckoutEntity, Long> {
}
