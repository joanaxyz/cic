package com.appdev.xyz.gakog5.service.auth;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.auth.response.SessionResponse;
import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.entity.auth.Token;
import com.appdev.xyz.gakog5.entity.auth.TokenType;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.auth.SessionRepository;
import com.appdev.xyz.gakog5.repository.auth.TokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SessionService {
    private final SessionRepository sessionRepository;
    private final TokenRepository tokenRepository;

    @Transactional
    public List<Session> findAllSessions(){
        return sessionRepository.findAll();
    }

    @Transactional
    public List<SessionResponse> convertAllToSessionResponses(List<Session> sessions) {
        List<SessionResponse> responses = new ArrayList<>();
        for (Session session : sessions) {
            responses.add(convertToSessionResponse(session));
        }
        return responses;
    }
    @Transactional
    public SessionResponse convertToSessionResponse(Session session) {
        return SessionResponse.builder()
            .id(session.getId())
            .userId(session.getUser().getId())
            .active(session.isActive())
            .build();
    }

    @Transactional
    public Session updateOrCreateSession(User user) {

        Optional<Session> optSession = sessionRepository.findByUser(user);

        if (optSession.isPresent()) {
            Session session = optSession.get();
            Token refreshToken = session.getRefreshToken();
            refreshToken.refresh(LocalDateTime.now().plusDays(30));
            Token accessToken = session.getAccessToken();
            accessToken.refresh(LocalDateTime.now().plusHours(1));
            tokenRepository.save(refreshToken);
            tokenRepository.save(accessToken);
            session.setActive(true);
            return sessionRepository.save(session);
        }

        Token accessToken = Token.builder() // create token service soon
                .user(user)
                .tokenType(TokenType.ACCESS)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        tokenRepository.save(accessToken);

        Token refreshToken = Token.builder()
                .user(user)
                .tokenType(TokenType.REFRESH)
                .expiresAt(LocalDateTime.now().plusDays(30))
                .build();
        tokenRepository.save(refreshToken);

        Session session = Session.builder()
                .user(user)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .active(true)
                .build();

        return sessionRepository.save(session);
    }
    
    @Transactional
    public Session refreshToken(String token) {
        // get session with this refreshToken
        Session session = sessionRepository.findByRefreshToken_Value(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        Token refreshToken = session.getRefreshToken();
        if(refreshToken.isExpired()){
            throw new IllegalArgumentException("Refresh token has expired");
        }
        Token accessToken = session.getAccessToken();
        // refresh access token
        accessToken.refresh(LocalDateTime.now().plusHours(1));
        tokenRepository.save(refreshToken);
        return sessionRepository.save(session);
    }

    @Transactional
    public Session validateAccessToken(String token) {
        Session session = sessionRepository.findByAccessToken_Value(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid access token"));
        Token accessToken = session.getAccessToken();
        if (accessToken.isExpired()) {
            throw new IllegalArgumentException("Access token has expired");
        }

        return session;
    }

    public ApiResponse validateSession(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing authorization header");
        }
        String token = authHeader.substring(7);
        Session session = validateAccessToken(token);
        if (!session.isActive()) {
           throw new IllegalArgumentException("Session is inactive");
        }
        return new ApiResponse("Session is validated");
    }


    @Transactional
    public Session findSessionByUser(User user){
        return sessionRepository.findByUser(user)
            .orElseThrow(() -> new IllegalArgumentException("No session found with that user."));
    }

    @Transactional
    public void setActive(Session session, boolean active){
        session.setActive(active);
        sessionRepository.save(session);
    }
}
