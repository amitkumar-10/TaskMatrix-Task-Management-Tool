package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String note;            // optional note
    // required when rejecting
}