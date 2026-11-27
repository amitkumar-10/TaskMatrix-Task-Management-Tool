package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitTaskRequest {

    @NotBlank(message = "Submission link is required")
    private String submissionLink;  // GitHub PR / Figma / Doc

    private String submissionNote;  // optional note
}