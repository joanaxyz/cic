package com.appdev.xyz.gakog5.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.appdev.xyz.gakog5.entity.user.User;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "access_token_id", nullable = false)
    private Token accessToken;

    @OneToOne
    @JoinColumn(name = "refresh_token_id", nullable = false)
    private Token refreshToken;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private boolean active;

    @PrePersist
    public void prePersist(){
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (!active) active = true;
    }
}
