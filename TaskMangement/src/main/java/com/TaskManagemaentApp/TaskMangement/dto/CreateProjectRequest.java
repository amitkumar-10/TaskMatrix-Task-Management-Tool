package com.TaskManagemaentApp.TaskMangement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Organisation ID is required")
    private String orgId;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    private String projectLeaderId; // memberId of project leader
    // optional at creation

    private String visibility;  // PUBLIC / PRIVATE
    // default to PRIVATE if not provided

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}