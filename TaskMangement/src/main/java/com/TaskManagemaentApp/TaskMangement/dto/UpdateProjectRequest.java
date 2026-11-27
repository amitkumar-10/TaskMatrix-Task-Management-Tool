package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateProjectRequest {

    private String name;
    private String description;
    private String status;          // ACTIVE / COMPLETED / ON_HOLD / CANCELLED
    private String projectLeaderId; // memberId of new leader
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}