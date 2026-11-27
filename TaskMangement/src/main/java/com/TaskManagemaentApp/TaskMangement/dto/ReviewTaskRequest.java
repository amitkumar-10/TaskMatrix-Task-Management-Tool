package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewTaskRequest {

    @NotBlank(message = "Action is required")
    private String action;          // APPROVE / REJECT

    private String note;            // required when REJECT
    // optional when APPROVE
}