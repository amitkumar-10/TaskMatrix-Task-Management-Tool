package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrgRequest {

    @NotBlank(message = "Organisation name is required")
    private String name;

    private String description;
    private String avatarUrl;
}