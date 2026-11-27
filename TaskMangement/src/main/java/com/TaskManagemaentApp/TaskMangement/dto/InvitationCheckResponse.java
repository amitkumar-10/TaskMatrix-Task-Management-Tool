package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationCheckResponse {

    private String token;
    private String orgId;
    private String orgName;
    private String invitedEmail;
    private boolean isRegistered;   // frontend uses this to decide
    // show login or signup page
    private String status;
    private String message;
}