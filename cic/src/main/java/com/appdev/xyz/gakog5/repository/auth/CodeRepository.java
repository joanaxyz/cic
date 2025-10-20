package com.appdev.xyz.gakog5.repository.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appdev.xyz.gakog5.entity.auth.Code;
import com.appdev.xyz.gakog5.entity.user.User;

import java.util.Optional;


@Repository
public interface CodeRepository extends JpaRepository<Code, Long> {
    Optional<Code> findByValue(String value);
    void deleteAllByUser(User user);
}
