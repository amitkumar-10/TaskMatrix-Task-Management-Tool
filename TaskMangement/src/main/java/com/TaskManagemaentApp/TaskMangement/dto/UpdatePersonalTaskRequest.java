package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdatePersonalTaskRequest {

    private String title;
    private String description;
    private String priority;
    private String status;          // TODO/IN_PROGRESS/DONE
    private String note;
    private LocalDateTime dueDate;
}