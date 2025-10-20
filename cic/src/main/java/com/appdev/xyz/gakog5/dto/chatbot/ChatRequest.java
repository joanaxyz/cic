package com.appdev.xyz.gakog5.dto.chatbot;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    private String question;
    private UUID id;
    private Long categoryId;
    private boolean test;
}
