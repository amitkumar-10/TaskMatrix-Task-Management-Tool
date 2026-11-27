package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    // ── Org Dashboard ─────────────────────────────────────────────
    public OrgDashboardResponse getOrgDashboard(
            String orgId, String userId) {

        // 1. check org exists
        Organisation org = organisationRepository
                .findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is member
        memberRepository.findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. total active members
        int totalMembers = memberRepository
                .findByOrgIdAndStatus(orgId, "ACTIVE")
                .size();

        // 4. projects
        List<Project> allProjects = projectRepository
                .findByOrgId(orgId);

        int totalProjects = allProjects.size();
        int activeProjects = (int) allProjects.stream()
                .filter(p -> p.getStatus().equals("ACTIVE"))
                .count();
        int completedProjects = (int) allProjects.stream()
                .filter(p -> p.getStatus().equals("COMPLETED"))
                .count();

        // 5. all tasks in org (across all projects)
        List<Task> allTasks = allProjects.stream()
                .flatMap(p -> taskRepository
                        .findByProjectId(p.getId())
                        .stream())
                .toList();

        int totalTasks = allTasks.size();

        // 6. tasks grouped by status
        Map<String, Integer> tasksByStatus = new HashMap<>();
        tasksByStatus.put("UNASSIGNED", 0);
        tasksByStatus.put("TODO", 0);
        tasksByStatus.put("IN_PROGRESS", 0);
        tasksByStatus.put("IN_REVIEW", 0);
        tasksByStatus.put("DONE", 0);

        for (Task task : allTasks) {
            tasksByStatus.merge(task.getStatus(), 1, Integer::sum);
        }

        // 7. tasks grouped by priority
        Map<String, Integer> tasksByPriority = new HashMap<>();
        tasksByPriority.put("LOW", 0);
        tasksByPriority.put("MEDIUM", 0);
        tasksByPriority.put("HIGH", 0);
        tasksByPriority.put("CRITICAL", 0);

        for (Task task : allTasks) {
            tasksByPriority.merge(
                    task.getPriority(), 1, Integer::sum
            );
        }

        // 8. recent activity — last 10 tasks updated
        List<Map<String, Object>> recentActivity = allTasks
                .stream()
                .sorted((a, b) -> b.getUpdatedAt()
                        .compareTo(a.getUpdatedAt()))
                .limit(10)
                .map(task -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("taskId", task.getId());
                    activity.put("title", task.getTitle());
                    activity.put("status", task.getStatus());
                    activity.put("assignedToName",
                            task.getAssignedToName());
                    activity.put("updatedAt", task.getUpdatedAt());
                    return activity;
                })
                .toList();

        return OrgDashboardResponse.builder()
                .orgId(orgId)
                .orgName(org.getName())
                .totalMembers(totalMembers)
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .totalTasks(totalTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentActivity(recentActivity)
                .build();
    }

    // ── Project Dashboard ───────────────────────────────────────
    public ProjectDashboardResponse getProjectDashboard(
            String projectId, String userId) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. check project access (same visibility rule)
        if (project.getVisibility() == null ||
                project.getVisibility().equals("PRIVATE")) {

            boolean isAdmin = requester.getRole().equals("ADMIN");
            boolean isLeader = project.getProjectLeaderId() != null
                    && project.getProjectLeaderId().equals(userId);
            boolean isTeamMember = teamMemberRepository
                    .findByProjectIdAndUserId(projectId, userId)
                    .stream()
                    .anyMatch(tm -> tm.getStatus().equals("ACTIVE"));

            if (!isAdmin && !isLeader && !isTeamMember) {
                throw new RuntimeException(
                        "You do not have access to this project."
                );
            }
        }

        // 4. teams in project
        List<Team> teams = teamRepository
                .findByProjectIdAndStatus(projectId, "ACTIVE");
        int totalTeams = teams.size();

        // 5. total team members (across all teams, deduplicated)
        Set<String> uniqueMemberIds = new HashSet<>();
        for (Team team : teams) {
            teamMemberRepository
                    .findByTeamIdAndStatus(team.getId(), "ACTIVE")
                    .forEach(tm -> uniqueMemberIds.add(tm.getUserId()));
        }
        int totalTeamMembers = uniqueMemberIds.size();

        // 6. tasks in project
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        int totalTasks = tasks.size();

        // 7. tasks by status
        Map<String, Integer> tasksByStatus = new HashMap<>();
        tasksByStatus.put("UNASSIGNED", 0);
        tasksByStatus.put("TODO", 0);
        tasksByStatus.put("IN_PROGRESS", 0);
        tasksByStatus.put("IN_REVIEW", 0);
        tasksByStatus.put("DONE", 0);
        for (Task task : tasks) {
            tasksByStatus.merge(task.getStatus(), 1, Integer::sum);
        }

        // 8. tasks by priority
        Map<String, Integer> tasksByPriority = new HashMap<>();
        tasksByPriority.put("LOW", 0);
        tasksByPriority.put("MEDIUM", 0);
        tasksByPriority.put("HIGH", 0);
        tasksByPriority.put("CRITICAL", 0);
        for (Task task : tasks) {
            tasksByPriority.merge(
                    task.getPriority(), 1, Integer::sum
            );
        }

        // 9. team progress — % done per team
        List<Map<String, Object>> teamProgress = teams.stream()
                .map(team -> {
                    List<Task> teamTasks = taskRepository
                            .findByTeamId(team.getId());

                    int teamTotal = teamTasks.size();
                    int teamDone = (int) teamTasks.stream()
                            .filter(t -> t.getStatus().equals("DONE"))
                            .count();

                    int progressPercent = teamTotal > 0
                            ? (teamDone * 100 / teamTotal) : 0;

                    Map<String, Object> progress = new HashMap<>();
                    progress.put("teamId", team.getId());
                    progress.put("teamName", team.getName());
                    progress.put("totalTasks", teamTotal);
                    progress.put("completedTasks", teamDone);
                    progress.put("progressPercent", progressPercent);
                    return progress;
                })
                .toList();

        // 10. unassigned tasks count
        int unassignedCount = (int) tasks.stream()
                .filter(t -> t.getAssignedTo() == null)
                .count();

        // 11. overdue tasks count (dueDate passed, not DONE)
        int overdueCount = (int) tasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDateTime.now())
                        && !t.getStatus().equals("DONE"))
                .count();

        // 12. leader name
        String leaderName = null;
        if (project.getProjectLeaderId() != null) {
            leaderName = userRepository
                    .findById(project.getProjectLeaderId())
                    .map(User::getName)
                    .orElse("Unknown");
        }

        return ProjectDashboardResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .status(project.getStatus())
                .projectLeaderName(leaderName)
                .totalTeams(totalTeams)
                .totalTeamMembers(totalTeamMembers)
                .totalTasks(totalTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .teamProgress(teamProgress)
                .unassignedTasksCount(unassignedCount)
                .overdueTasksCount(overdueCount)
                .build();
    }

    // ── Member Dashboard ─────────────────────────────────────────
    // requesterId = who is asking, targetUserId = whose dashboard
    public MemberDashboardResponse getMemberDashboard(
            String orgId, String targetUserId, String requesterId) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is member
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. permission check:
        // a member can view their OWN dashboard
        // ADMIN/PROJECT_LEADER can view ANYONE's dashboard
        boolean isOwnDashboard = requesterId.equals(targetUserId);
        boolean isAdminOrLeader =
                requester.getRole().equals("ADMIN") ||
                        requester.getRole().equals("PROJECT_LEADER");

        if (!isOwnDashboard && !isAdminOrLeader) {
            throw new RuntimeException(
                    "You can only view your own dashboard."
            );
        }

        // 4. check target user is member of org
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        memberRepository.findByOrgIdAndUserId(orgId, targetUserId)
                .orElseThrow(() -> new RuntimeException(
                        "User is not a member of this organisation."
                ));

        // 5. all tasks assigned to target user in org
        List<Task> tasks = taskRepository
                .findByOrgIdAndAssignedTo(orgId, targetUserId);

        int totalAssigned = tasks.size();
        int totalCompleted = (int) tasks.stream()
                .filter(t -> t.getStatus().equals("DONE"))
                .count();

        String completionRate = totalAssigned > 0
                ? (totalCompleted * 100 / totalAssigned) + "%"
                : "0%";

        // 6. tasks by status
        Map<String, Integer> tasksByStatus = new HashMap<>();
        tasksByStatus.put("TODO", 0);
        tasksByStatus.put("IN_PROGRESS", 0);
        tasksByStatus.put("IN_REVIEW", 0);
        tasksByStatus.put("DONE", 0);
        for (Task task : tasks) {
            tasksByStatus.merge(task.getStatus(), 1, Integer::sum);
        }

        // 7. tasks by priority
        Map<String, Integer> tasksByPriority = new HashMap<>();
        tasksByPriority.put("LOW", 0);
        tasksByPriority.put("MEDIUM", 0);
        tasksByPriority.put("HIGH", 0);
        tasksByPriority.put("CRITICAL", 0);
        for (Task task : tasks) {
            tasksByPriority.merge(
                    task.getPriority(), 1, Integer::sum
            );
        }

        // 8. active tasks (not DONE)
        List<Map<String, Object>> activeTasks = tasks.stream()
                .filter(t -> !t.getStatus().equals("DONE"))
                .map(this::taskSummary)
                .toList();

        // 9. overdue tasks
        List<Map<String, Object>> overdueTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDateTime.now())
                        && !t.getStatus().equals("DONE"))
                .map(this::taskSummary)
                .toList();

        // 10. recently completed (last 5, most recent first)
        List<Map<String, Object>> recentlyCompleted = tasks.stream()
                .filter(t -> t.getStatus().equals("DONE"))
                .sorted((a, b) -> b.getUpdatedAt()
                        .compareTo(a.getUpdatedAt()))
                .limit(5)
                .map(this::taskSummary)
                .toList();

        return MemberDashboardResponse.builder()
                .userId(targetUser.getId())
                .name(targetUser.getName())
                .email(targetUser.getEmail())
                .totalTasksAssigned(totalAssigned)
                .totalTasksCompleted(totalCompleted)
                .completionRate(completionRate)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .activeTasks(activeTasks)
                .overdueTasks(overdueTasks)
                .recentlyCompleted(recentlyCompleted)
                .build();
    }

    // ── Task summary helper ──────────────────────────────────────
    private Map<String, Object> taskSummary(Task task) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("taskId", task.getId());
        summary.put("title", task.getTitle());
        summary.put("status", task.getStatus());
        summary.put("priority", task.getPriority());
        summary.put("dueDate", task.getDueDate());
        summary.put("updatedAt", task.getUpdatedAt());
        return summary;
    }
}