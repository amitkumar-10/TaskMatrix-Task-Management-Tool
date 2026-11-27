package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String orgId;
    private String projectId;
    private String teamId;

    private String title;
    private String description;

    private String priority;        // LOW / MEDIUM / HIGH / CRITICAL
    private String status;          // UNASSIGNED / TODO / IN_PROGRESS
    // IN_REVIEW / DONE

    private String assignedTo;      // userId (null if unassigned)
    private String assignedToName;
    private String createdBy;       // userId

    // submission details
    private String submissionLink;  // GitHub PR / Figma / Doc link
    private String submissionNote;  // member's note

    // review details
    private String reviewNote;      // leader's review note
    private String reviewedBy;      // userId of reviewer

    private boolean reminder3DaySent;
    private boolean reminder1DaySent;
    private boolean reminderDueTodaySent;
    private boolean reminderOverdueSent;

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}