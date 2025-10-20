package com.appdev.xyz.gakog5.service.chatbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.appdev.xyz.gakog5.dto.chatbot.NLPResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Category;
import com.appdev.xyz.gakog5.repository.chatbot.CategoryRepository;

import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NLPService {

    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate;

    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.1-8b-instant";

    @Value("${groq.api.key}")
    private String groqApiKey;

    /**
     * Process user question with a specific category
     * If categoryId is provided, answer from that category only
     * If categoryId is null, return a general response
     */
    public NLPResponse processQuestion(String userQuestion, Long categoryId) {
        log.info("Processing question: {} for category: {}", userQuestion, categoryId);

        if (categoryId == null) {
            return generateGeneralResponse(userQuestion);
        }

        Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
        
        if (categoryOpt.isEmpty()) {
            log.warn("Category not found: {}", categoryId);
            return generateGeneralResponse(userQuestion);
        }

        Category category = categoryOpt.get();
        String answer = generateAnswerFromCategory(userQuestion, category);

        return NLPResponse.builder()
                .answer(answer)
                .confidence(1.0)
                .categoryId(category.getId())
                .categoryName(category.getName())
                .build();
    }

    /**
     * Generate answer from specific category content using LLM
     */
    private String generateAnswerFromCategory(String question, Category category) {
        try {
            // Check if category has content
            if (category.getContent() == null || category.getContent().trim().isEmpty()) {
                return String.format("The %s category doesn't have any content yet. Please add content to this category first.", 
                    category.getName());
            }

            String prompt = String.format(
                """
                You are a helpful assistant for the "%s" category.
                
                Knowledge Base Content:
                %s
                
                User Question: %s
                
                Answer the user's question based ONLY on the content provided above. 
                Be conversational and helpful. If the content doesn't contain the answer, 
                politely say you don't have that specific information in this category.
                
                Format your response with:
                - **Bold text** for important information
                - Use bullet points (-) when listing items
                - Use numbered lists (1. 2. 3.) for step-by-step instructions
                - Use line breaks for better readability
                - Keep paragraphs concise and clear
                """,
                category.getName(),
                category.getContent(),
                question
            );

            String response = callGroqAPI(prompt);
            
            if (response != null && !response.trim().isEmpty()) {
                return response;
            }
            
            // Fallback if API fails
            return extractRelevantContent(category.getContent(), question);
            
        } catch (Exception e) {
            log.error("Error generating answer from category: {}", e.getMessage());
            return "I'm having trouble processing your question right now. Please try again.";
        }
    }

    /**
     * Generate a general response when no category is specified
     */
    private NLPResponse generateGeneralResponse(String question) {
        try {
            String prompt = String.format(
                """
                A user asked: "%s"
                
                This is a general question without a specific category. 
                Generate a brief, helpful response (2-3 sentences) that either:
                1. Answers the question if it's a common general knowledge question
                2. Suggests they select a category for more specific help
                
                Format your response with:
                - **Bold text** for important information
                - Use bullet points (-) when listing items
                - Keep the response concise and friendly
                """,
                question
            );

            String response = callGroqAPI(prompt);
            String answer = response != null ? response : 
                "Please select a category to get specific information, or ask me a more specific question.";

            return NLPResponse.builder()
                    .answer(answer)
                    .confidence(0.5)
                    .categoryId(null)
                    .categoryName("General")
                    .build();
            
        } catch (Exception e) {
            log.error("Error generating general response: {}", e.getMessage());
            return NLPResponse.builder()
                    .answer("Please select a category to get specific information.")
                    .confidence(0.0)
                    .categoryId(null)
                    .categoryName("General")
                    .build();
        }
    }

    /**
     * Extract relevant portion of content as fallback
     */
    private String extractRelevantContent(String content, String question) {
        if (content == null || content.isEmpty()) {
            return "I don't have enough information to answer that question.";
        }

        // Return first 500 characters as a simple fallback
        if (content.length() <= 500) {
            return content;
        }

        return content.substring(0, 500) + "...";
    }

    /**
     * Call Groq API to generate responses
     */
    private String callGroqAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1000);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    GROQ_API_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> messageObj = (Map<String, String>) firstChoice.get("message");

                    if (messageObj != null && messageObj.containsKey("content")) {
                        return messageObj.get("content").trim();
                    }
                }
            }

            return null;

        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get statistics about categories
     */
    public Map<String, Object> getCategoryStatistics() {
        List<Category> categories = categoryRepository.findAll();
        Map<String, Object> stats = new HashMap<>();

        for (Category category : categories) {
            Map<String, Object> categoryStats = new HashMap<>();
            categoryStats.put("contentLength", category.getContent() != null ? category.getContent().length() : 0);
            categoryStats.put("hasContent", category.getContent() != null && !category.getContent().isEmpty());
            stats.put(category.getName(), categoryStats);
        }

        stats.put("totalCategories", categories.size());
        stats.put("categoriesWithContent", categories.stream()
            .filter(c -> c.getContent() != null && !c.getContent().isEmpty())
            .count());

        return stats;
    }
}