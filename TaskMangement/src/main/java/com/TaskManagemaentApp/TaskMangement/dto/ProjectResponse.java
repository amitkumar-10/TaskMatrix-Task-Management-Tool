package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private String id;
    private String orgId;
    private String name;
    private String description;
    private String status;

    private String visibility;

    private String createdBy;
    private String createdByName;

    private String projectLeaderId;
    private String projectLeaderName;

    private int totalTeams;
    private int totalTasks;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
}