package com.appdev.xyz.gakog5.dto.auth.request;

import com.appdev.xyz.gakog5.entity.user.UserRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private UserRole role;
}