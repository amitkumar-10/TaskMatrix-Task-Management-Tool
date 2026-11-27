package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {

    private String id;
    private String orgId;
    private String orgName;
    private String invitedEmail;
    private String invitedBy;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
