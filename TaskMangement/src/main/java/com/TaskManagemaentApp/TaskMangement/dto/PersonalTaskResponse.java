package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalTaskResponse {

    private String id;
    private String userId;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String note;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
