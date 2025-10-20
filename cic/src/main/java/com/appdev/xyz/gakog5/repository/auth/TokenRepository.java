package com.appdev.xyz.gakog5.repository.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appdev.xyz.gakog5.entity.auth.Token;


public interface TokenRepository extends JpaRepository<Token, Long>{
    Optional<Token> findByValue(String value);
}
