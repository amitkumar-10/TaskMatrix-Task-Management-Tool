package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "personal_tasks")
public class PersonalTask {

    @Id
    private String id;

    private String userId;          // owner

    private String title;
    private String description;

    private String priority;        // LOW / MEDIUM / HIGH / CRITICAL
    private String status;          // TO_DO / IN_PROGRESS / DONE

    private String note;            // personal note

    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}