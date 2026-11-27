package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponse {

    private String id;
    private String orgId;
    private String projectId;
    private String projectName;
    private String name;
    private String description;
    private String status;
    private String createdBy;
    private String createdByName;
    private int totalMembers;
    private LocalDateTime createdAt;
}