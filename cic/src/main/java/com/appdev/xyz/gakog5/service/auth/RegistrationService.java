package com.appdev.xyz.gakog5.service.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appdev.xyz.gakog5.dto.auth.request.RegisterRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.auth.response.VerifyEmailResponse;
import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.PendingUser;
import com.appdev.xyz.gakog5.entity.user.Student;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.entity.user.UserRole;
import com.appdev.xyz.gakog5.repository.user.AdminRepository;
import com.appdev.xyz.gakog5.repository.user.StudentRepository;
import com.appdev.xyz.gakog5.repository.user.UserRepository;
import com.appdev.xyz.gakog5.service.user.PendingUserService;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    
    private final PendingUserService pendingUserService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    @Transactional
    public ApiResponse initiateRegistration(RegisterRequest req) {
        String email = req.getEmail();
        
        // Check if already a verified user
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("You're already registered. Try logging in instead.");
        }
        
        // Handle existing pending user
        try{
            PendingUser existingPending = pendingUserService.findPendingUserByEmail(email);
            if(existingPending!= null){     
                return handleExistingPendingUser(existingPending, req);
            }
        }catch(IllegalArgumentException e){
            
        }

        // Create new pending user
        PendingUser pendingUser = pendingUserService.createPendingUser(req);
        sendVerificationEmail(pendingUser, req);
        
        return new ApiResponse("Verification email sent. Please check your inbox.");
    }

    private ApiResponse handleExistingPendingUser(PendingUser pendingUser, RegisterRequest req) {
        if (!pendingUser.isTokenExpired()) {
            throw new IllegalStateException(
                "This email has been registered as pending. Awaiting verification."
            );
        }
        
        // Renew token for expired pending user
        pendingUserService.renewVeritifactionToken(pendingUser);
        sendVerificationEmail(pendingUser, req);
        
        return new ApiResponse("Verification email resent. Please check your inbox.");
    }

    private void sendVerificationEmail(PendingUser pendingUser, RegisterRequest req) {
        String emailBody = emailTemplateService.createAccountVerificationEmail(
            req.getFirstName(),
            req.getLastName(),
            pendingUser.getVerificationToken()
        );
        emailService.sendEmail(pendingUser.getEmail(), "Verify Account", emailBody);
    }

    @Transactional
    public VerifyEmailResponse checkVerificationStatus(String token) {
        VerifyEmailResponse response = new VerifyEmailResponse();

        try{
            PendingUser user = pendingUserService.findByVerificationToken(token);
            response.setEmail(user.getEmail());
            response.setName(user.getFirstName() + " " + user.getLastName());
            response.setState(user.isTokenExpired() ? "Expired" : "Pending");
        }catch(IllegalArgumentException e){
            response.setState("Verified");
            return response;
        }
        
        return response;
    }

    @Transactional
    public String completeRegistration(String email) {
        PendingUser pendingUser = null;
        try{
            pendingUser = pendingUserService.findPendingUserByEmail(email);
        }catch(IllegalArgumentException e){
            throw new IllegalArgumentException("Pending user not found");
        }
        User user = convertToUser(pendingUser);
        
        if (user.getRole() == UserRole.STUDENT) {
            studentRepository.save(
                Student.builder()
                .user(user)
                .build()
                );
        } else {
            adminRepository.save(
                Admin.builder()
                .user(user)
                .build()
            );
        }
        
        pendingUserService.deletePendingUser(pendingUser);
        
        return String.format("Account: %s has been registered", user.getEmail());
    }

    private User convertToUser(PendingUser pendingUser) {
        User user = User.builder()
        .firstName(pendingUser.getFirstName())
        .lastName(pendingUser.getLastName())
        .email(pendingUser.getEmail())
        .password(pendingUser.getPassword())
        .role(pendingUser.getRole())
        .build();
        return userRepository.save(user);
    }
}