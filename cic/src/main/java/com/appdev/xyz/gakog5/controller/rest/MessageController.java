package com.appdev.xyz.gakog5.controller.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.entity.chatbot.Message;
import com.appdev.xyz.gakog5.service.chatbot.MessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/message")
public class MessageController {
    private final MessageService messageService;
    @RequireAuth
    @PostMapping("/handle-like/{id}/{like}")
    public ResponseEntity<?> handleLike(@PathVariable Long id, @PathVariable Boolean like){
        try{
            Message message = messageService.handleLike(id, like);
            return ResponseEntity.ok(new ApiResponse("Like is successfully handled", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try{
            Message message = messageService.deleteMessage(id);
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/updateBot/{id}/{text}")
    public ResponseEntity<?> deleteBot(@PathVariable Long id, @PathVariable String text) {
        try{
            Message message = messageService.updateBotMessage(id, text);
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/updateUser/{id}/{text}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @PathVariable String text) {
        try{
            Message message = messageService.updateUserMessage(id, text);
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }
}
