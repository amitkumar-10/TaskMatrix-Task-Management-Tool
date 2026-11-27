package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private String id;
    private String orgId;
    private String projectId;
    private String projectName;
    private String teamId;
    private String teamName;

    private String title;
    private String description;
    private String priority;
    private String status;

    private String assignedTo;
    private String assignedToName;
    private String createdBy;
    private String createdByName;

    private String submissionLink;
    private String submissionNote;
    private String reviewNote;
    private String reviewedBy;
    private String reviewedByName;

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}