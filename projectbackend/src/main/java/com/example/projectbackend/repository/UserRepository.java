package com.example.projectbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.projectbackend.model.User;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(User.Role role);

    boolean existsByEmail(String email);

    List<User> findByRoleAndSpecialization(User.Role role, String specialization);
}
