package com.zipflow.zipflowserver.repository;

import com.zipflow.zipflowserver.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("userRepository")
public interface UserRepository extends JpaRepository<UserEntity, Long>  {
    Optional<UserEntity> findByEmail(String email);
}
