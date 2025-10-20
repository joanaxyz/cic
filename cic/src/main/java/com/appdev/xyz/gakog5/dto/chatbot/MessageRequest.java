package com.appdev.xyz.gakog5.dto.chatbot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageRequest {
    private Long id;
    private Boolean like;
    private String text;
}
