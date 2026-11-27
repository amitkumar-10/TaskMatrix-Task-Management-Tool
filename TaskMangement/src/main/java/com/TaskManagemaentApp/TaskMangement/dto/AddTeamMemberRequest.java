package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddTeamMemberRequest {

    @NotBlank(message = "Team ID is required")
    private String teamId;

    @NotBlank(message = "User ID is required")
    private String userId;          // userId of member to add
}