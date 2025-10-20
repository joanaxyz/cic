package com.appdev.xyz.gakog5.entity.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import com.appdev.xyz.gakog5.entity.user.User;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String value;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private TokenType tokenType;

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }

    public void refresh(LocalDateTime expiresAt){
        createdAt = LocalDateTime.now();
        value = UUID.randomUUID().toString();
        this.expiresAt = expiresAt;
    }

    @PrePersist
    public void prePersist() {
        if (value == null) {
            value = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
