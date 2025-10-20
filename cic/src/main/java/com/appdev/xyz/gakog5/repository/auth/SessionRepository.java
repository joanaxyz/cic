package com.appdev.xyz.gakog5.repository.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.entity.user.User;


@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findByUser(User user);
    Optional<Session> findByRefreshToken_Value(String value);
    Optional<Session> findByAccessToken_Value(String value);
}

