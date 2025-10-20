package com.appdev.xyz.gakog5.dto.auth.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    private String password;
    private String token;
}