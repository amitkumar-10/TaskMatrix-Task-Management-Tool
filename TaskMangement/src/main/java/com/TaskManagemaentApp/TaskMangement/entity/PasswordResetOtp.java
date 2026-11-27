package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "password_reset_otps")
public class PasswordResetOtp {

    @Id
    private String id;

    private String userId;
    private String email;
    private String otp;
    private boolean used;

    private String resetToken;          // generated after OTP verified
    private LocalDateTime resetTokenExpiresAt;  // 10 min expiry

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean isResetTokenExpired() {
        return LocalDateTime.now().isAfter(this.resetTokenExpiresAt);
    }
}