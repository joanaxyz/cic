package com.appdev.xyz.gakog5.service.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    public String createAccountVerificationEmail(String firstName, String lastName, String token) {
        String verificationLink = baseUrl + "/cic/auth/verify-account?token=" + token;
        
        return """
                Hello %s %s,

                We received a request to register an account using this email address.

                If you made this request, please verify your registration by clicking the link below:
                %s

                If you did not request this registration, you can safely ignore this email. No account will be created.

                Thank you,
                CIC Team
                """.formatted(firstName, lastName, verificationLink);
    }

    public String createPasswordResetEmail(String firstName, String lastName, String code) {
        return """
                Hello %s %s,

                We received a request to reset your account password.

                To continue, please use the verification code below:
                
                Verification Code: %s

                This code will expire in 5 minutes. 
                If you did not request a password reset, you can safely ignore this email. 
                Your account will remain secure.

                Thank you,
                The CIC Team
                """.formatted(firstName, lastName, code);
    }
}