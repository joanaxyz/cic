package com.appdev.xyz.gakog5.service.auth;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.entity.auth.Code;
import com.appdev.xyz.gakog5.entity.auth.Token;
import com.appdev.xyz.gakog5.entity.auth.TokenType;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.repository.auth.CodeRepository;
import com.appdev.xyz.gakog5.repository.auth.TokenRepository;
import com.appdev.xyz.gakog5.repository.user.UserRepository;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository userRepository;
    private final CodeRepository codeRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        codeRepository.deleteAllByUser(user);
        
        Code code = Code.builder()
        .user(user)
        .expiration(5)
        .build();
        codeRepository.save(code); 
        
        String emailBody = emailTemplateService.createPasswordResetEmail(
            user.getFirstName(),
            user.getLastName(),
            code.getValue()
        );
        
        emailService.sendEmail(email, "Verify Password Reset", emailBody);
    }

    @Transactional
    public String verifyResetCode(String code) {
        Code userCode = codeRepository.findByValue(code)
            .orElseThrow(() -> new IllegalArgumentException("Verification code not found or has expired."));
        
        if (userCode.isExpired()) {
            codeRepository.delete(userCode);
            throw new IllegalArgumentException("Verification code expired.");
        }
        
        User user = userCode.getUser();
        Token token = Token.builder()
        .user(user)
        .tokenType(TokenType.VERIFICATION)
        .expiresAt(LocalDateTime.now().plusMinutes(5))
        .build();
        tokenRepository.save(token);
        
        codeRepository.delete(userCode);
        
        return token.getValue();
    }

    @Transactional
    public void resetPassword(String tokenCode, String newPassword) {
        Token token = tokenRepository.findByValue(tokenCode)
            .orElseThrow(() -> new IllegalArgumentException("Token not found"));
        
        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new IllegalArgumentException("Token expired");
        }
        
        User user = token.getUser();
        validateNewPassword(user, newPassword);
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Clean up the used token
        tokenRepository.delete(token);
    }

    private void validateNewPassword(User user, String newPassword) {
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException(
                "Your new password cannot be the same as your current password."
            );
        }
    }
}