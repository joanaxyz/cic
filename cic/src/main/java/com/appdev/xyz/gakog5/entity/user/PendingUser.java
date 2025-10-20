package com.appdev.xyz.gakog5.entity.user;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@NoArgsConstructor 
@Getter
@Setter
@Entity
@AllArgsConstructor
@Builder
public class PendingUser{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;
    private String firstName, lastName, password;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(unique = true, nullable = false)
    private String verificationToken;
    @Enumerated(EnumType.STRING)
    private UserRole role;
    @Column(nullable = false)
    private LocalDateTime tokenCreatedAt; 
    private static final long TOKEN_VALID_HOURS = 24;

    public boolean isTokenExpired() {
        return tokenCreatedAt.plusHours(TOKEN_VALID_HOURS).isBefore(LocalDateTime.now());
    }

    @PrePersist
    private void prePersist(){
        if(tokenCreatedAt == null) tokenCreatedAt = LocalDateTime.now();
    }
}
