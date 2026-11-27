package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teams")
public class Team {

    @Id
    private String id;

    private String orgId;
    private String projectId;
    private String name;            // Frontend Team, Backend Team etc
    private String description;
    private String status;          // ACTIVE / INACTIVE
    private String createdBy;       // userId

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}