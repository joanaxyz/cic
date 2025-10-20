package com.appdev.xyz.gakog5.dto.auth.response;

import java.time.LocalDateTime;

import com.appdev.xyz.gakog5.entity.user.UserRole;

import lombok.*;
@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private UserRole role;
    private LocalDateTime lastLogin;
    private LocalDateTime lastLogout;
    private LocalDateTime joinedAt;
    private boolean banned;
}
