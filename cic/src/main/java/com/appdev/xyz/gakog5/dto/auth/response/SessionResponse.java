package com.appdev.xyz.gakog5.dto.auth.response;


import java.time.LocalDateTime;

import lombok.*;

@Getter
@Setter
@Builder
public class SessionResponse {
    private Long id;
    private Long userId;
    private String accessToken;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private boolean active;
}
