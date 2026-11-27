package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTeamRequest {

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Team name is required")
    private String name;

    private String description;
}
