package com.appdev.xyz.gakog5.service.user;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.auth.request.RegisterRequest;
import com.appdev.xyz.gakog5.entity.user.PendingUser;
import com.appdev.xyz.gakog5.repository.user.PendingUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PendingUserService {
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    public PendingUser findPendingUserByEmail(String email){
        return pendingUserRepository.findByEmail(email).orElseThrow(
            ()->new IllegalArgumentException("Pending user with this email does not exist"));
    }

    @Transactional
    public PendingUser createPendingUser(RegisterRequest req) {
        String hashedPassword = passwordEncoder.encode(req.getPassword());
        String token = UUID.randomUUID().toString();
        
        PendingUser pendingUser = PendingUser.builder()
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .email(req.getEmail())
            .password(hashedPassword)
            .role(req.getRole())
            .verificationToken(token)
            .build();
        return pendingUserRepository.save(pendingUser);
    }

    @Transactional
    public PendingUser renewVeritifactionToken(PendingUser pendingUser){
        pendingUser.setVerificationToken(UUID.randomUUID().toString());
        return pendingUserRepository.save(pendingUser);
    }

    @Transactional
    public PendingUser findByVerificationToken(String token){
        return pendingUserRepository.findByVerificationToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));
    }

    @Transactional
    public void deletePendingUser(PendingUser pendingUser){
        pendingUserRepository.delete(pendingUser);
    }
}
