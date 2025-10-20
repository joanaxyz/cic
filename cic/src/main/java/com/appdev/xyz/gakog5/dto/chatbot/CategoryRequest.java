package com.appdev.xyz.gakog5.dto.chatbot;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CategoryRequest {
    private Long id;
    private String name;
    private String content;
    private List<String> presets;
}
