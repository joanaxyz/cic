package com.appdev.xyz.gakog5.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.user.PendingUser;

import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long>{
    Optional<PendingUser> findByEmail(String email);
    Optional<PendingUser> findByVerificationToken(String token);
} 
