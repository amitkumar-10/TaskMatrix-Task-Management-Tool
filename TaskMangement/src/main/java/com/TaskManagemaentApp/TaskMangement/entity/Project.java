package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "projects")
public class Project {

    @Id
    private String id;

    private String orgId;
    private String name;
    private String description;

    private String status;          // ACTIVE / COMPLETED / ON_HOLD / CANCELLED

    private String visibility = "PRIVATE";  // PUBLIC / PRIVATE

    private String createdBy;       // userId who created
    private String projectLeaderId; // userId of project leader

    private boolean reminder3DaySent;
    private boolean reminder1DaySent;
    private boolean reminderDueTodaySent;

    private LocalDateTime startDate;
    private LocalDateTime endDate;  // deadline

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}