package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "team_members")
public class TeamMember {

    @Id
    private String id;

    private String teamId;
    private String projectId;
    private String orgId;
    private String userId;
    private String status;          // ACTIVE / REMOVED

    private LocalDateTime joinedAt;
    private LocalDateTime updatedAt;
}