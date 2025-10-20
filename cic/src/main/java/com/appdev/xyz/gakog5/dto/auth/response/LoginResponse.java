package com.appdev.xyz.gakog5.dto.auth.response;

import lombok.*;
@Getter
@Setter
public class LoginResponse {
    private UserResponse user;
    private SessionResponse session;
}
