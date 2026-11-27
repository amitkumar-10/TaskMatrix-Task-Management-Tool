package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMemberRoleRequest {

    @NotBlank(message = "Member ID is required")
    private String memberId;

    @NotBlank(message = "Role is required")
    private String role;            // MEMBER / PROJECT_LEADER / ADMIN
}
