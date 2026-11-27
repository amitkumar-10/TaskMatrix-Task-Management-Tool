package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Team ID is required")
    private String teamId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String priority;        // LOW / MEDIUM / HIGH / CRITICAL
    // default MEDIUM

    private String assignedTo;      // userId (optional at creation)

    private LocalDateTime dueDate;
}