package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDashboardResponse {

    private String projectId;
    private String projectName;
    private String status;
    private String projectLeaderName;

    private int totalTeams;
    private int totalTeamMembers;

    private int totalTasks;
    private Map<String, Integer> tasksByStatus;
    private Map<String, Integer> tasksByPriority;

    private List<Map<String, Object>> teamProgress;
    private int unassignedTasksCount;
    private int overdueTasksCount;
}