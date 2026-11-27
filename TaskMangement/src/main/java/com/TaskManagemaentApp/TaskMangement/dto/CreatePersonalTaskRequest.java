package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreatePersonalTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String priority;        // default MEDIUM
    private String note;
    private LocalDateTime dueDate;
}