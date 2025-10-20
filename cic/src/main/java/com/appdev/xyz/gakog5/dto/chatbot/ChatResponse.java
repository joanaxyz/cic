package com.appdev.xyz.gakog5.dto.chatbot;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@lombok.Data
@lombok.Builder
public  class ChatResponse {
    private UUID id;
    private Long userId;
    private LocalDateTime timestamp;
    private String title;
    private List<MessageResponse> messages;
}