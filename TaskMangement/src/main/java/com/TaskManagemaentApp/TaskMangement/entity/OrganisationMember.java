package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "organisation_members")
public class OrganisationMember {

    @Id
    private String id;

    private String orgId;
    private String userId;
    private String role;            // ADMIN / MEMBER / PROJECT_LEADER
    private String status;          // ACTIVE / LEFT

    private LocalDateTime joinedAt;
    private LocalDateTime updatedAt;
}