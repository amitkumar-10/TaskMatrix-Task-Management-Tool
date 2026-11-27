package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;

@Data
@Builder       // ← make sure this is there
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResetOtpResponse {

    private String resetToken;
    private String message;
}