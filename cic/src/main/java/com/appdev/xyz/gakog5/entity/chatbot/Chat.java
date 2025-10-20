package com.appdev.xyz.gakog5.entity.chatbot;

import java.time.LocalDateTime;
import java.util.UUID;

import com.appdev.xyz.gakog5.entity.user.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Chat {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String title;
    private LocalDateTime timestamp;

    @PrePersist
    private void PrePersist(){
        if(timestamp == null) timestamp = LocalDateTime.now();
    }

    @PreUpdate
    private void PreUpdate(){
        timestamp = LocalDateTime.now();
    }
}
