package com.appdev.xyz.gakog5.service.chatbot;

import org.springframework.stereotype.Service;

import com.appdev.xyz.gakog5.dto.chatbot.MessageResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Message;
import com.appdev.xyz.gakog5.repository.chatbot.MessageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;

    @Transactional
    public MessageResponse convertToMessageResponse(Message message){
        return MessageResponse.builder()
                .id(message.getId())
                .userMessage(message.getUserMessage())
                .botMessage(message.getBotMessage())
                .timestamp(message.getTimestamp())
                .like(message.getLike())
                .category(message.getCategory() != null ? message.getCategory().getName() : null)
                .build();
    }
    @Transactional
    public Message handleLike(Long id, boolean like){
        Message message = findMessageById(id);
        message.setLike(like);
        return messageRepository.save(message);
    }

    @Transactional
    public Message deleteMessage(Long id){
        Message message = findMessageById(id);
        messageRepository.delete(message);
        return message;
    }

    @Transactional
    public Message updateBotMessage(Long id, String text){
        Message message = findMessageById(id);
        message.setBotMessage(text);
        return messageRepository.save(message);
    }

    @Transactional
    public Message updateUserMessage(Long id, String text){
     Message message = findMessageById(id);
        message.setUserMessage(text);
        return messageRepository.save(message);
    }

    @Transactional
    public Message findMessageById(Long id){
        return messageRepository.findById(id)
            .orElseThrow(()-> new IllegalArgumentException("Message with that id does not exist."));
    }
}
