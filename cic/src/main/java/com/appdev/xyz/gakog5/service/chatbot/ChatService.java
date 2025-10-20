package com.appdev.xyz.gakog5.service.chatbot;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.chatbot.ChatRequest;
import com.appdev.xyz.gakog5.dto.chatbot.ChatResponse;
import com.appdev.xyz.gakog5.dto.chatbot.MessageResponse;
import com.appdev.xyz.gakog5.dto.chatbot.NLPResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Chat;
import com.appdev.xyz.gakog5.entity.chatbot.Message;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.chatbot.ChatRepository;
import com.appdev.xyz.gakog5.repository.chatbot.MessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final NLPService nlpService;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final CategoryService categoryService;

    @Transactional
    public NLPResponse processQuery(ChatRequest req, User user){
        String question = req.getQuestion();
        NLPResponse nlpResponse = nlpService.processQuestion(question, req.getCategoryId());
        return nlpResponse;
    }


    @Transactional
    public Message saveQueryToChat(ChatRequest req, User user, String answer){
        String question = req.getQuestion();
        UUID chatId = req.getId();
        Message message = Message.builder()
        .botMessage(answer)
        .userMessage(question)
        .category(categoryService.findCategoryById(req.getCategoryId()))
        .build();

        Chat chat = null;
        
        if(chatId == null){
            chat = createChat(user, question);
            message.setChat(chat);
        }else{
            chat = updateChat(chatId, message);
        }
        messageRepository.save(message);
        return message;
    }

    @Transactional 
    public List<ChatResponse> convertAllToChatResponse(List<Chat> chats){
        List<ChatResponse> response = new ArrayList<>();

        for (Chat c : chats) {
            response.add(convertToChatResponse(c));
        }
        return response;
    }

    @Transactional
    public ChatResponse convertToChatResponse(Chat chat){
        List<Message> messages = messageRepository.findByChat(chat);

        List<MessageResponse> response = new ArrayList<>();
        User user = chat.getUser();
        Long userId = user != null ? user.getId() : null;

        messages.forEach(m->{
            response.add(
                MessageResponse.builder()
                    .id(m.getId())
                    .botMessage(m.getBotMessage())
                    .userMessage(m.getUserMessage())
                    .timestamp(m.getTimestamp())
                    .like(m.getLike())
                    .category(m.getCategory() != null ? m.getCategory().getName() : null)
                    .build()
            );
        });

        return ChatResponse.builder()
            .id(chat.getId())
            .userId(userId)
            .title(chat.getTitle())
            .messages(response)
            .timestamp(chat.getTimestamp())
            .build();
    }

    @Transactional
    public List<Chat> getAll(){
        return chatRepository.findAll();
    }


    @Transactional
    public List<Chat> getAllChatsByUser(User user){
        return chatRepository.findByUser(user);
    }

    @Transactional
    public Chat createChat(User user, String title){
        return chatRepository.save(Chat.builder()
            .user(user)
            .title(title)
            .build());
    }

    @Transactional
    private Chat updateChat(UUID chatId, Message message){
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(()-> new IllegalArgumentException("Chat with that id does not exist"));
        message.setChat(chat);
        return chat;
    }

    @Transactional
    public Chat deleteChat(UUID id){
        
        Chat chat = findChatById(id);
        List<Message> messages = messageRepository.findByChat(chat);
        messageRepository.deleteAll(messages);
        chatRepository.delete(chat);
        return chat;
    }

    @Transactional
    public Chat findChatById(UUID id){
        return chatRepository.findById(id)
            .orElseThrow(()-> new IllegalArgumentException("Chat with this id does not exist/"));
    }
}
