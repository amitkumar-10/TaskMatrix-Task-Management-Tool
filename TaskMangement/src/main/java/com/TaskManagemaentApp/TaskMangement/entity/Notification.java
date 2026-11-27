package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;          // who receives
    private String title;
    private String message;
    private String type;            // TASK_ASSIGNED / TASK_REVIEWED
    // TASK_SUBMITTED / MEMBER_JOINED
    // MEMBER_LEFT / TASK_UNASSIGNED

    private String referenceId;     // taskId / orgId / memberId
    private String referenceType;   // TASK / ORG / MEMBER

    private boolean read;           // false by default
    private LocalDateTime createdAt;
}