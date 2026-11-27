package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invitations")
public class Invitation {

    @Id
    private String id;

    private String orgId;
    private String invitedEmail;
    private String invitedUserId;   // null if not registered yet
    private String invitedBy;       // adminId who sent invite

    private String token;           // unique invite token
    private String status;          // PENDING / ACCEPTED / EXPIRED / CANCELLED

    private LocalDateTime expiresAt;  // 7 days
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}