package com.appdev.xyz.gakog5.controller.rest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.UUIDRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.chatbot.ChatRequest;
import com.appdev.xyz.gakog5.dto.chatbot.NLPResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Chat;
import com.appdev.xyz.gakog5.entity.chatbot.Message;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.service.chatbot.ChatService;
import com.appdev.xyz.gakog5.service.chatbot.MessageService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;




@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final MessageService messageService;
    @RequireAuth
    @PostMapping("/process-query")
    public ResponseEntity<?> processQuery(@RequestBody ChatRequest req, HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        try{
            NLPResponse response = chatService.processQuery(req, user);
            if(req.isTest()){
                return ResponseEntity.ok(new ApiResponse("The query has been processed", response.getAnswer()));
            }else{
                req.setCategoryId(response.getCategoryId());
                Message message = chatService.saveQueryToChat(req, user, response.getAnswer());
                Chat chat = message.getChat();
                return ResponseEntity.ok(new ApiResponse(response.getAnswer(), chatService.convertToChatResponse(chat), messageService.convertToMessageResponse(message)));
            }
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/delete")
    public ResponseEntity<?> deleteChat(@RequestBody UUIDRequest req){
        try{
            Chat chat = chatService.deleteChat(req.getId());
            return ResponseEntity.ok(new ApiResponse("Category deleted successfully", chat));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @GetMapping("/getAllByUser")
    public ResponseEntity<?> getAllChatsByUser(HttpServletRequest request) {
        User user = (User) request.getAttribute("currentUser");
        try{
            List<Chat> chats = chatService.getAllChatsByUser(user);
            return ResponseEntity.ok(new ApiResponse("Chats were successfully fetched", chatService.convertAllToChatResponse(chats)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @GetMapping("/getAll")
    public ResponseEntity<?> getAllChats() {
        try{
            List<Chat> chats = chatService.getAll();
            return ResponseEntity.ok(new ApiResponse("Chats were successfully fetched", chatService.convertAllToChatResponse(chats)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }
}
