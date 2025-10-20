package com.appdev.xyz.gakog5.controller.rest;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.TokenRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.auth.response.SessionResponse;
import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.service.auth.SessionService;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/session")
public class SessionController {
    private final SessionService sessionService;

    @RequireAuth
    @GetMapping("/getAll")
    public ResponseEntity<?> getAllSessions() {
        try{
            List<Session> sessions = sessionService.findAllSessions();
            return ResponseEntity.ok(new ApiResponse("Users fetched successfully", sessionService.convertAllToSessionResponses(sessions)));
        }catch(DataAccessException e){
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/validate-session")
    public ResponseEntity<?> validateSession(@RequestHeader("Authorization") String authHeader) {
        try{
            return ResponseEntity.ok(sessionService.validateSession(authHeader));
        }catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(e.getMessage()));
        }
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse> refreshToken(@RequestBody TokenRequest req) {
        try {
            Session session = sessionService.refreshToken(req.getToken());
            SessionResponse response = SessionResponse.builder()
                    .accessToken(session.getAccessToken().getValue())
                    .refreshToken(session.getRefreshToken().getValue())
                    .expiresAt(session.getAccessToken().getExpiresAt())
                    .build();
            return ResponseEntity.ok(new ApiResponse("Token refreshed", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

}