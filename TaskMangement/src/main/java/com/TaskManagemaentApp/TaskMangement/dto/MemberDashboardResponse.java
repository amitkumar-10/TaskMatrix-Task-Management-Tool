package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDashboardResponse {

    private String userId;
    private String name;
    private String email;

    private int totalTasksAssigned;
    private int totalTasksCompleted;
    private String completionRate;     // "75%"

    private Map<String, Integer> tasksByStatus;
    private Map<String, Integer> tasksByPriority;

    private List<Map<String, Object>> activeTasks;
    private List<Map<String, Object>> overdueTasks;
    private List<Map<String, Object>> recentlyCompleted;
}