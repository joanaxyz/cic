package com.appdev.xyz.gakog5.dto.chatbot;

@lombok.Data
@lombok.Builder
public  class NLPResponse {
    private String answer;
    private double confidence;
    private Long categoryId;
    private String categoryName;
    private Long matchedQueryId;
}