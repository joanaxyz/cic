package com.appdev.xyz.gakog5.controller.rest.user;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpServerErrorException.InternalServerError;

import com.appdev.xyz.gakog5.annotation.RequireAdminAuth;
import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.IdRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.service.user.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @RequireAuth
    @GetMapping("/getAll")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try{
            List<User> users = userService.findAllUsers();
            return ResponseEntity.ok(new ApiResponse("Users fetched successfully", userService.convertAllToUserResponse(users)));
        }catch(DataAccessException e){
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(e.getMessage()));
        }
    }
    
    @RequireAdminAuth
    @PostMapping("/ban")
    public ResponseEntity<ApiResponse> banUser(@RequestBody IdRequest req) {
        try{
            Long userId = userService.banUser(req.getId()).getId();
            return ResponseEntity.ok(new ApiResponse("User banned successfully", userId));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAdminAuth
    @PostMapping("/unban")
    public ResponseEntity<ApiResponse> unbanUser(@RequestBody IdRequest req) {
        try{
            Long userId = userService.unbanUser(req.getId()).getId();
            return ResponseEntity.ok(new ApiResponse("User unbanned successfully", userId));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }
    
    @RequireAdminAuth
    @PostMapping("/promote")
    public ResponseEntity<ApiResponse> promoteUser(@RequestBody IdRequest req){
          try{
            Long userId = userService.promoteToAdmin(req.getId()).getId();
            return ResponseEntity.ok(new ApiResponse("User promoted to admin successfully", userId));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAdminAuth
    @PostMapping("/demote")
    public ResponseEntity<ApiResponse> demoteUser(@RequestBody IdRequest req){
          try{
            Long userId = userService.demoteToStudent(req.getId()).getId();
            return ResponseEntity.ok(new ApiResponse("User demoted to student successfully", userId));
        }catch(IllegalArgumentException e){
            return ResponseEntity.badRequest()
                .body(new ApiResponse(e.getMessage()));
        }catch(InternalServerError e){
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(e.getMessage()));
        }
    }
}
