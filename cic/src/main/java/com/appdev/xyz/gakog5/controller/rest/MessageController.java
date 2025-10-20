package com.appdev.xyz.gakog5.controller.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.IdRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.chatbot.MessageRequest;
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
    @PostMapping("/handle-like")
    public ResponseEntity<?> handleLike(@RequestBody MessageRequest req){
        try{
            Message message = messageService.handleLike(req.getId(), req.getLike());
            return ResponseEntity.ok(new ApiResponse("Like is successfully handled", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/delete")
    public ResponseEntity<?> delete(@RequestBody IdRequest req) {
        try{
            Message message = messageService.deleteMessage(req.getId());
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/updateBot")
    public ResponseEntity<?> updateBot(@RequestBody MessageRequest req) {
        try{
            Message message = messageService.updateBotMessage(req.getId(), req.getText());
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @PostMapping("/updateUser}")
    public ResponseEntity<?> updateUser(@RequestBody MessageRequest req) {
        try{
            Message message = messageService.updateUserMessage(req.getId(), req.getText());
            return ResponseEntity.ok(new ApiResponse("Message deleted successfully", messageService.convertToMessageResponse(message)));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }
}
