package com.appdev.xyz.gakog5.entity.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import com.appdev.xyz.gakog5.entity.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Entity
public class Code {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;
    private String value;
    @Column(nullable = false)
    private LocalDateTime createdAt; 
    private int expiration;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String generateSixDigitCode() {
        SecureRandom secureRandom = new SecureRandom();
        int number = secureRandom.nextInt(900000) + 100000;
        return String.valueOf(number);
    }

    public boolean isExpired() {
        return createdAt.plusMinutes(expiration).isBefore(LocalDateTime.now());
    }

    @PrePersist
    public void prePersist() {
        if (value == null) {
            value = generateSixDigitCode();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
