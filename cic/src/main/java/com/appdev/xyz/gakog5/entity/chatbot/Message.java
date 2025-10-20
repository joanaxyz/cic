package com.appdev.xyz.gakog5.entity.chatbot;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import lombok.*;
@Entity
@Builder
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "TEXT")
    private String userMessage;
    @Column(columnDefinition = "TEXT")
    private String botMessage;
    @Column(name = "liked", nullable = true)
    private Boolean like;
    private LocalDateTime timestamp;
    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    @PrePersist
    private void PrePersist(){
        if(timestamp == null) timestamp = LocalDateTime.now();
    }
}
