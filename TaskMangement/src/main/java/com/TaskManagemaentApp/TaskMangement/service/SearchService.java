package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final OrganisationMemberRepository memberRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskService taskService;

    // ── Global search within org ─────────────────────────────────
    public SearchResponse searchInOrg(
            String orgId, String query, String userId) {

        // 1. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (query == null || query.isBlank()) {
            throw new RuntimeException(
                    "Search query cannot be empty."
            );
        }

        // 2. search projects
        List<Project> matchedProjects = projectRepository
                .searchByOrgIdAndName(orgId, query);

        // filter by visibility/access same as getOrgProjects
        List<ProjectResponse> projectResults = matchedProjects.stream()
                .filter(project -> hasProjectAccess(
                        project, requester, userId))
                .map(this::buildProjectResponseLite)
                .toList();

        // 3. search tasks
        List<Task> matchedTasks = taskRepository
                .searchByOrgIdAndTitle(orgId, query);

        List<TaskResponse> taskResults = matchedTasks.stream()
                .filter(task -> hasTaskAccess(
                        task, requester, userId))
                .map(this::buildTaskResponseLite)
                .toList();

        // 4. search members (only admin/leader can search members)
        List<MemberResponse> memberResults = List.of();
        if (requester.getRole().equals("ADMIN") ||
                requester.getRole().equals("PROJECT_LEADER")) {

            List<User> matchedUsers = userRepository
                    .searchByNameOrEmail(query);

            memberResults = matchedUsers.stream()
                    .map(user -> memberRepository
                            .findByOrgIdAndUserId(orgId, user.getId())
                            .filter(m -> m.getStatus().equals("ACTIVE"))
                            .map(m -> MemberResponse.builder()
                                    .memberId(m.getId())
                                    .userId(user.getId())
                                    .name(user.getName())
                                    .email(user.getEmail())
                                    .avatarUrl(user.getAvatarUrl())
                                    .role(m.getRole())
                                    .status(m.getStatus())
                                    .userRoles(user.getRoles())
                                    .joinedAt(m.getJoinedAt())
                                    .build())
                            .orElse(null))
                    .filter(m -> m != null)
                    .toList();
        }

        int total = projectResults.size()
                + taskResults.size()
                + memberResults.size();

        log.info("Search '{}' in org {} → {} results",
                query, orgId, total);

        return SearchResponse.builder()
                .query(query)
                .projects(projectResults)
                .tasks(taskResults)
                .members(memberResults)
                .totalResults(total)
                .build();
    }

    // ── Search tasks within a specific project ────────────────────
    public List<TaskResponse> searchTasksInProject(
            String projectId, String query, String userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (query == null || query.isBlank()) {
            throw new RuntimeException(
                    "Search query cannot be empty."
            );
        }

        List<Task> matchedTasks = taskRepository
                .searchByProjectIdAndTitle(projectId, query);

        return matchedTasks.stream()
                .filter(task -> hasTaskAccess(task, requester, userId))
                .map(this::buildTaskResponseLite)
                .toList();
    }

    // ── Access helpers ──────────────────────────────────────────
    private boolean hasProjectAccess(
            Project project, OrganisationMember requester, String userId) {

        if (project.getVisibility() == null ||
                project.getVisibility().equals("PUBLIC")) {
            return true;
        }

        if (requester.getRole().equals("ADMIN")) return true;

        boolean isLeader = project.getProjectLeaderId() != null
                && project.getProjectLeaderId().equals(userId);

        boolean isTeamMember = teamMemberRepository
                .findByProjectIdAndUserId(project.getId(), userId)
                .stream()
                .anyMatch(tm -> tm.getStatus().equals("ACTIVE"));

        return isLeader || isTeamMember;
    }

    private boolean hasTaskAccess(
            Task task, OrganisationMember requester, String userId) {

        if (requester.getRole().equals("ADMIN")) return true;

        Project project = projectRepository
                .findById(task.getProjectId())
                .orElse(null);
        if (project == null) return false;

        boolean isLeader = project.getProjectLeaderId() != null
                && project.getProjectLeaderId().equals(userId);

        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().equals(userId);

        return isLeader || isAssigned;
    }

    // ── Lightweight response builders (avoid N+1 heavy lookups) ──
    private ProjectResponse buildProjectResponseLite(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .orgId(project.getOrgId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .build();
    }

    private TaskResponse buildTaskResponseLite(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .orgId(task.getOrgId())
                .projectId(task.getProjectId())
                .teamId(task.getTeamId())
                .title(task.getTitle())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assignedToName(task.getAssignedToName())
                .dueDate(task.getDueDate())
                .build();
    }
}