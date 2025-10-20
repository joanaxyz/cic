package com.appdev.xyz.gakog5.service.auth;

import lombok.RequiredArgsConstructor;

import javax.naming.AuthenticationException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.auth.response.LoginResponse;
import com.appdev.xyz.gakog5.dto.auth.response.SessionResponse;
import com.appdev.xyz.gakog5.dto.auth.response.UserResponse;
import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.entity.user.PendingUser;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.service.user.PendingUserService;
import com.appdev.xyz.gakog5.service.user.UserService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final PendingUserService pendingUserService;

    @Transactional
    public LoginResponse login(String email, String rawPassword) throws AuthenticationException {

        try{
            PendingUser pendingUser = pendingUserService.findPendingUserByEmail(email);
            if(pendingUser != null){     
                throw new AuthenticationException("Please verify your account to continue.");
            }
        }catch(IllegalArgumentException e){
            
        }

        // Authenticate user
        User user = userService.findUserByEmail(email);

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Incorrect Passsword");
        }

        Session session = sessionService.updateOrCreateSession(user);

        LoginResponse response = new LoginResponse();
        UserResponse userResponse = userService.convertToUserResponse(user);
        SessionResponse sessionResponse = sessionService.convertToSessionResponse(session);
        sessionResponse.setRefreshToken(session.getRefreshToken().getValue());
        sessionResponse.setAccessToken(session.getAccessToken().getValue());

        response.setUser(userResponse);
        response.setSession(sessionResponse);

        userService.updateLastLogin(user);
        return response;
    }

    public void logout (Session session, User user){
        sessionService.setActive(session, false);
        userService.updateLastLogout(user);
    }
}