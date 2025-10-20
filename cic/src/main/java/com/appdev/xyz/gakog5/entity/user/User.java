package com.appdev.xyz.gakog5.entity.user;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;


@NoArgsConstructor 
@AllArgsConstructor
@Builder
@Getter
@Setter
@Entity
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Setter(AccessLevel.NONE)
    private Long id;
    private String firstName, lastName, password;
    @Column(unique = true)
    private String email;
    @Enumerated(EnumType.STRING)
    private UserRole role;
    @Builder.Default
    private boolean banned = false;
    private LocalDateTime createdAt;
    private LocalDateTime lastlogin;
    private LocalDateTime lastLogout;

    public void updateLastLogin(){
        lastlogin = LocalDateTime.now();
    }

    public void udpateLastLogout(){
        lastLogout = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist(){
        if(createdAt == null) createdAt = LocalDateTime.now();
    }
}
