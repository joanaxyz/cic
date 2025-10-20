package com.appdev.xyz.gakog5.repository.user;

import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.entity.user.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndPassword(String email, String password);
    List<User> findByRole(UserRole role);
}

