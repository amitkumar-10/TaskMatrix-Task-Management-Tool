package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgDashboardResponse {

    private String orgId;
    private String orgName;

    private int totalMembers;
    private int totalProjects;
    private int activeProjects;
    private int completedProjects;

    private int totalTasks;
    private Map<String, Integer> tasksByStatus;  // TODO:5, DONE:10 etc
    private Map<String, Integer> tasksByPriority;

    private List<Map<String, Object>> recentActivity;
}