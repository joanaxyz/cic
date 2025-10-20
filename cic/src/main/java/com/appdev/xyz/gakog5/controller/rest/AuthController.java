package com.appdev.xyz.gakog5.controller.rest;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import javax.naming.AuthenticationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.dto.auth.request.CodeRequest;
import com.appdev.xyz.gakog5.dto.auth.request.EmailRequest;
import com.appdev.xyz.gakog5.dto.auth.request.LoginRequest;
import com.appdev.xyz.gakog5.dto.auth.request.RegisterRequest;
import com.appdev.xyz.gakog5.dto.auth.request.ResetPasswordRequest;
import com.appdev.xyz.gakog5.dto.auth.request.TokenRequest;
import com.appdev.xyz.gakog5.dto.auth.response.ApiResponse;
import com.appdev.xyz.gakog5.dto.auth.response.LoginResponse;
import com.appdev.xyz.gakog5.dto.auth.response.VerifyEmailResponse;
import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.entity.user.User;
import com.appdev.xyz.gakog5.service.auth.AuthService;
import com.appdev.xyz.gakog5.service.auth.PasswordResetService;
import com.appdev.xyz.gakog5.service.auth.RegistrationService;


@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RegistrationService registrationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/sign-up")
    public ResponseEntity<ApiResponse> signup(@RequestBody RegisterRequest req) {
        try {
            ApiResponse response = registrationService.initiateRegistration(req);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-status")
    public ResponseEntity<ApiResponse> verifyStatus(@RequestBody TokenRequest req) {
        VerifyEmailResponse response = registrationService.checkVerificationStatus(req.getToken());
        HttpStatus status = switch (response.getState()) {
            case "Pending" -> HttpStatus.OK;
            case "Expired" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.NOT_FOUND;
        };
        return ResponseEntity.status(status)
                .body(new ApiResponse(getStatusMessage(response.getState()), response));
    }

    @PostMapping("/verify-account")
    public ResponseEntity<ApiResponse> verifyRegistration(@RequestBody EmailRequest req) {
        try {
            String message = registrationService.completeRegistration(req.getEmail());
            return ResponseEntity.ok(new ApiResponse(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/sign-in")
    public ResponseEntity<ApiResponse> signin(@RequestBody LoginRequest req) {
        try {
            LoginResponse response = authService.login(req.getEmail(), req.getPassword());
            return ResponseEntity.ok(new ApiResponse("Login successful", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        } catch(AuthenticationException e){
               return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-code-to-mail")
    public ResponseEntity<ApiResponse> sendCodeToMail(@RequestBody EmailRequest req) {
        try {
            passwordResetService.initiatePasswordReset(req.getEmail());
            return ResponseEntity.ok(
                    new ApiResponse("Verification code sent! Please check your inbox."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse> verifyCode(@RequestBody CodeRequest req) {
        try {
            String resetToken = passwordResetService.verifyResetCode(req.getCode());
            return ResponseEntity.ok(
                    new ApiResponse("Code verified! You can now reset your password.", resetToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody ResetPasswordRequest req) {
        try {
            passwordResetService.resetPassword(req.getToken(), req.getPassword());
            return ResponseEntity.ok(
                    new ApiResponse("Password reset successful! You can now login"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @RequireAuth
    @GetMapping("/sign-out")
    public ResponseEntity<ApiResponse> signout(HttpServletRequest request) {
        Session currentSession = (Session) request.getAttribute("currentSession");
        User currentUser = (User) request.getAttribute("currentUser");
        authService.logout(currentSession, currentUser);
        return ResponseEntity.ok(new ApiResponse("Signed out successfully"));
    }

    private String getStatusMessage(String state) {
        return switch (state) {
            case "Pending" -> "Awaiting verification";
            case "Expired" -> "Token has expired";
            default -> "Token not found or already used";
        };
    }
}