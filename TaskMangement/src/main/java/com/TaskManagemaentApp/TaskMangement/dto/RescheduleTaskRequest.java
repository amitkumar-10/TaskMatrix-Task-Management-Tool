package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RescheduleTaskRequest {
    private LocalDateTime dueDate;
}