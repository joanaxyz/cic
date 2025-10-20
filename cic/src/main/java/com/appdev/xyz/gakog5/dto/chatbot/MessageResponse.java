package com.appdev.xyz.gakog5.dto.chatbot;

import java.time.LocalDateTime;


@lombok.Data
@lombok.Builder
public  class MessageResponse {
    private Long id;
    private LocalDateTime timestamp;
    private String botMessage, userMessage;
    private Boolean like;
    private String category;
}