package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── Create Task ──────────────────────────────────────────────
    public TaskResponse createTask(
            String userId, CreateTaskRequest request) {

        // find project
        Project project = projectRepository
                .findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        //  find team
        Team team = teamRepository
                .findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        //  check team belongs to project
        if (!team.getProjectId().equals(request.getProjectId())) {
            throw new RuntimeException(
                    "Team does not belong to this project."
            );
        }

        //  check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // only ADMIN or PROJECT_LEADER can create task
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can create tasks."
            );
        }

        // project leader can only create task
        // in their own project
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(userId)) {
            throw new RuntimeException(
                    "You can only create tasks in your own project."
            );
        }

        //  validate priority
        String priority = request.getPriority() != null
                ? request.getPriority() : "MEDIUM";

        if (!priority.equals("LOW") &&
                !priority.equals("MEDIUM") &&
                !priority.equals("HIGH") &&
                !priority.equals("CRITICAL")) {
            throw new RuntimeException(
                    "Invalid priority. Must be LOW, MEDIUM, HIGH or CRITICAL."
            );
        }

        //  handle assignedTo if provided
        String assignedTo = null;
        String assignedToName = null;
        String status = "UNASSIGNED";

        if (request.getAssignedTo() != null) {

            // check assigned user is team member
            boolean isTeamMember = teamMemberRepository
                    .existsByTeamIdAndUserId(
                            request.getTeamId(),
                            request.getAssignedTo()
                    );

            if (!isTeamMember) {
                throw new RuntimeException(
                        "Assigned user is not a member of this team."
                );
            }

            assignedTo = request.getAssignedTo();
            assignedToName = userRepository
                    .findById(assignedTo)
                    .map(User::getName)
                    .orElse("Unknown");
            status = "TODO";
        }

        //  create task
        Task task = Task.builder()
                .orgId(project.getOrgId())
                .projectId(request.getProjectId())
                .teamId(request.getTeamId())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(priority)
                .status(status)
                .assignedTo(assignedTo)
                .assignedToName(assignedToName)
                .createdBy(userId)
                .dueDate(request.getDueDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        taskRepository.save(task);

        log.info("Task {} created in project {} by {}",
                task.getTitle(), request.getProjectId(), userId);

        return buildTaskResponse(task, project, team);
    }

    // ── Build task response ──────────────────────────────────────
    public TaskResponse buildTaskResponse(
            Task task, Project project, Team team) {

        String createdByName = userRepository
                .findById(task.getCreatedBy())
                .map(User::getName)
                .orElse("Unknown");

        String reviewedByName = null;
        if (task.getReviewedBy() != null) {
            reviewedByName = userRepository
                    .findById(task.getReviewedBy())
                    .map(User::getName)
                    .orElse("Unknown");
        }

        return TaskResponse.builder()
                .id(task.getId())
                .orgId(task.getOrgId())
                .projectId(task.getProjectId())
                .projectName(project.getName())
                .teamId(task.getTeamId())
                .teamName(team.getName())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .assignedTo(task.getAssignedTo())
                .assignedToName(task.getAssignedToName())
                .createdBy(task.getCreatedBy())
                .createdByName(createdByName)
                .submissionLink(task.getSubmissionLink())
                .submissionNote(task.getSubmissionNote())
                .reviewNote(task.getReviewNote())
                .reviewedBy(task.getReviewedBy())
                .reviewedByName(reviewedByName)
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    // ── Helper: get project and team ─────────────────────────────
    private Project getProject(String projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));
    }

    private Team getTeam(String teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));
    }

    // ── Get single task ──────────────────────────────────────────
    public TaskResponse getTask(String taskId, String userId) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. check access
        // ADMIN → sees all
        // LEADER → sees their project tasks
        // MEMBER → only their assigned tasks
        if (!requester.getRole().equals("ADMIN")) {

            Project project = getProject(task.getProjectId());

            boolean isLeader = project.getProjectLeaderId() != null
                    && project.getProjectLeaderId().equals(userId);

            boolean isAssigned = task.getAssignedTo() != null
                    && task.getAssignedTo().equals(userId);

            if (!isLeader && !isAssigned) {
                throw new RuntimeException(
                        "You do not have access to this task."
                );
            }
        }

        Project project = getProject(task.getProjectId());
        Team team = getTeam(task.getTeamId());

        return buildTaskResponse(task, project, team);
    }

    // ── Get all tasks in project ─────────────────────────────────
    public List<TaskResponse> getProjectTasks(
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

        List<Task> tasks;

        // 3. filter based on role
        if (requester.getRole().equals("ADMIN")) {
            // ADMIN sees all tasks
            tasks = taskRepository.findByProjectId(projectId);

        } else if (requester.getRole().equals("PROJECT_LEADER") &&
                project.getProjectLeaderId().equals(userId)) {
            // LEADER sees all tasks in their project
            tasks = taskRepository.findByProjectId(projectId);

        } else {
            // MEMBER sees only their assigned tasks
            tasks = taskRepository
                    .findByProjectIdAndAssignedTo(projectId, userId);
        }

        return tasks.stream()
                .map(task -> {
                    Team team = teamRepository
                            .findById(task.getTeamId())
                            .orElse(null);
                    if (team == null) return null;
                    return buildTaskResponse(task, project, team);
                })
                .filter(t -> t != null)
                .toList();
    }

    // ── Get tasks by team ────────────────────────────────────────
    public List<TaskResponse> getTeamTasks(
            String teamId, String userId) {

        // 1. find team
        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        // 2. find project
        Project project = projectRepository
                .findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(team.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        List<Task> tasks;

        // 4. filter based on role
        if (requester.getRole().equals("ADMIN")) {
            tasks = taskRepository.findByTeamId(teamId);

        } else if (requester.getRole().equals("PROJECT_LEADER") &&
                project.getProjectLeaderId().equals(userId)) {
            tasks = taskRepository.findByTeamId(teamId);

        } else {
            // MEMBER sees only their tasks in this team
            tasks = taskRepository
                    .findByProjectIdAndAssignedTo(
                            team.getProjectId(), userId);
        }

        return tasks.stream()
                .map(task -> buildTaskResponse(task, project, team))
                .toList();
    }

    // ── Get my tasks ─────────────────────────────────────────────
    public List<TaskResponse> getMyTasks(
            String orgId, String userId) {

        // 1. check org exists
        memberRepository
                .findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 2. get all tasks assigned to user in org
        List<Task> tasks = taskRepository
                .findByOrgIdAndAssignedTo(orgId, userId);

        return tasks.stream()
                .map(task -> {
                    Project project = projectRepository
                            .findById(task.getProjectId())
                            .orElse(null);
                    Team team = teamRepository
                            .findById(task.getTeamId())
                            .orElse(null);
                    if (project == null || team == null) return null;
                    return buildTaskResponse(task, project, team);
                })
                .filter(t -> t != null)
                .toList();
    }

    // ── Get tasks by status ──────────────────────────────────────
    public List<TaskResponse> getTasksByStatus(
            String projectId, String status, String userId) {

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

        // 3. validate status
        if (!status.equals("UNASSIGNED") &&
                !status.equals("TODO") &&
                !status.equals("IN_PROGRESS") &&
                !status.equals("IN_REVIEW") &&
                !status.equals("DONE")) {
            throw new RuntimeException(
                    "Invalid status. Must be UNASSIGNED, TODO, " +
                            "IN_PROGRESS, IN_REVIEW or DONE."
            );
        }

        // 4. get tasks
        List<Task> tasks = taskRepository
                .findByProjectIdAndStatus(projectId, status);

        // 5. filter for members
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            tasks = tasks.stream()
                    .filter(t -> t.getAssignedTo() != null
                            && t.getAssignedTo().equals(userId))
                    .toList();
        }

        return tasks.stream()
                .map(task -> {
                    Team team = teamRepository
                            .findById(task.getTeamId())
                            .orElse(null);
                    if (team == null) return null;
                    return buildTaskResponse(task, project, team);
                })
                .filter(t -> t != null)
                .toList();
    }

    // ── Get unassigned tasks in project ─────────────────────────
    public List<TaskResponse> getUnassignedTasks(
            String projectId, String userId) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check requester is ADMIN or PROJECT_LEADER
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can view unassigned tasks."
            );
        }

        // 3. get unassigned tasks
        List<Task> tasks = taskRepository
                .findByProjectIdAndAssignedToIsNull(projectId);

        return tasks.stream()
                .map(task -> {
                    Team team = teamRepository
                            .findById(task.getTeamId())
                            .orElse(null);
                    if (team == null) return null;
                    return buildTaskResponse(task, project, team);
                })
                .filter(t -> t != null)
                .toList();
    }


    // ── Assign Task ──────────────────────────────────────────────
    public TaskResponse assignTask(
            String requesterId,
            String taskId,
            AssignTaskRequest request) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. find project
        Project project = getProject(task.getProjectId());

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can assign
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can assign tasks."
            );
        }

        // 5. project leader can only assign
        // tasks in their own project
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(requesterId)) {
            throw new RuntimeException(
                    "You can only assign tasks in your own project."
            );
        }

        // 6. check task is not already DONE
        if (task.getStatus().equals("DONE")) {
            throw new RuntimeException(
                    "Cannot reassign a completed task."
            );
        }

        // 7. check assigned user is team member
        boolean isTeamMember = teamMemberRepository
                .existsByTeamIdAndUserId(
                        task.getTeamId(),
                        request.getUserId()
                );

        if (!isTeamMember) {
            throw new RuntimeException(
                    "User is not a member of this team."
            );
        }

        // 8. check assigned user is active org member
        OrganisationMember assignedMember = memberRepository
                .findByOrgIdAndUserId(
                        task.getOrgId(),
                        request.getUserId()
                )
                .orElseThrow(() -> new RuntimeException(
                        "User is not a member of this organisation."
                ));

        if (!assignedMember.getStatus().equals("ACTIVE")) {
            throw new RuntimeException(
                    "User is not an active member of this organisation."
            );
        }

        // 9. get assigned user name
        User assignedUser = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        // 10. assign task
        String previousAssignee = task.getAssignedTo();
        task.setAssignedTo(request.getUserId());
        task.setAssignedToName(assignedUser.getName());

        // 11. update status
        // if was UNASSIGNED → TODO
        // if was IN_REVIEW/IN_PROGRESS → keep status (reassignment)
        if (task.getStatus().equals("UNASSIGNED")) {
            task.setStatus("TODO");
        }

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        notificationService.sendNotification(
                request.getUserId(),
                "New Task Assigned",
                "You have been assigned: " + task.getTitle(),
                "TASK_ASSIGNED",
                task.getId(),
                "TASK"
        );

        if (previousAssignee == null) {
            log.info("Task {} assigned to {} by {}",
                    taskId, request.getUserId(), requesterId);
        } else {
            log.info("Task {} reassigned from {} to {} by {}",
                    taskId, previousAssignee,
                    request.getUserId(), requesterId);
        }

        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }

    // ── Unassign Task ────────────────────────────────────────────
    public TaskResponse unassignTask(
            String requesterId, String taskId) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. find project
        Project project = getProject(task.getProjectId());

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can unassign
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can unassign tasks."
            );
        }

        // 5. check task is not already DONE
        if (task.getStatus().equals("DONE")) {
            throw new RuntimeException(
                    "Cannot unassign a completed task."
            );
        }

        // 6. check task is already assigned
        if (task.getAssignedTo() == null) {
            throw new RuntimeException(
                    "Task is already unassigned."
            );
        }

        // 7. unassign
        task.setAssignedTo(null);
        task.setAssignedToName(null);
        task.setStatus("UNASSIGNED");
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task {} unassigned by {}", taskId, requesterId);

        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }


    // ── Update Task Status ───────────────────────────────────────
    public TaskResponse updateTaskStatus(
            String userId,
            String taskId,
            UpdateTaskStatusRequest request) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. find project
        Project project = getProject(task.getProjectId());

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. check task is assigned
        if (task.getStatus().equals("UNASSIGNED")) {
            throw new RuntimeException(
                    "Task must be assigned before updating status."
            );
        }

        String newStatus = request.getStatus();
        String currentStatus = task.getStatus();
        boolean isAdmin = requester.getRole().equals("ADMIN");
        boolean isLeader = requester.getRole()
                .equals("PROJECT_LEADER") &&
                project.getProjectLeaderId().equals(userId);
        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().equals(userId);

        // 5. validate status transition
        validateStatusTransition(
                currentStatus,
                newStatus,
                isAdmin,
                isLeader,
                isAssigned,
                request.getNote()
        );

        // 6. update status
        task.setStatus(newStatus);

        // 7. add review note if rejecting
        if (newStatus.equals("IN_PROGRESS") &&
                currentStatus.equals("IN_REVIEW")) {
            // rejected — add review note
            if (request.getNote() == null ||
                    request.getNote().isBlank()) {
                throw new RuntimeException(
                        "Please provide a note when rejecting a task."
                );
            }
            task.setReviewNote(request.getNote());
            task.setReviewedBy(userId);
        }

        // 8. add review note if approving
        if (newStatus.equals("DONE")) {
            task.setReviewNote(request.getNote());
            task.setReviewedBy(userId);
        }

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task {} status updated from {} to {} by {}",
                taskId, currentStatus, newStatus, userId);

        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }

    // ── Validate status transition ───────────────────────────────
    private void validateStatusTransition(
            String current,
            String next,
            boolean isAdmin,
            boolean isLeader,
            boolean isAssigned,
            String note) {

        switch (current) {

            case "TODO":
                // TODO → IN_PROGRESS only
                if (!next.equals("IN_PROGRESS")) {
                    throw new RuntimeException(
                            "Task can only move from TODO to IN_PROGRESS."
                    );
                }
                // only assigned member / leader / admin
                if (!isAssigned && !isLeader && !isAdmin) {
                    throw new RuntimeException(
                            "You can only update status of your own tasks."
                    );
                }
                break;

            case "IN_PROGRESS":
                // IN_PROGRESS → IN_REVIEW only
                if (!next.equals("IN_REVIEW")) {
                    throw new RuntimeException(
                            "Task can only move from IN_PROGRESS to IN_REVIEW."
                    );
                }
                // only assigned member / leader / admin
                if (!isAssigned && !isLeader && !isAdmin) {
                    throw new RuntimeException(
                            "You can only update status of your own tasks."
                    );
                }
                break;

            case "IN_REVIEW":
                // IN_REVIEW → DONE or IN_PROGRESS (reject)
                if (!next.equals("DONE") &&
                        !next.equals("IN_PROGRESS")) {
                    throw new RuntimeException(
                            "Task can only move from IN_REVIEW to " +
                                    "DONE (approved) or IN_PROGRESS (rejected)."
                    );
                }
                // only LEADER or ADMIN can review
                if (!isLeader && !isAdmin) {
                    throw new RuntimeException(
                            "Only project leaders or admins can review tasks."
                    );
                }
                break;

            case "DONE":
                // cannot move from DONE
                throw new RuntimeException(
                        "Task is already completed."
                );

            default:
                throw new RuntimeException(
                        "Invalid current task status."
                );
        }
    }


    // ── Submit Task ──────────────────────────────────────────────
    public TaskResponse submitTask(
            String userId,
            String taskId,
            SubmitTaskRequest request) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. check requester is member of org
        memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. only assigned member can submit
        if (task.getAssignedTo() == null ||
                !task.getAssignedTo().equals(userId)) {
            throw new RuntimeException(
                    "Only the assigned member can submit this task."
            );
        }

        // 4. task must be IN_PROGRESS to submit
        if (!task.getStatus().equals("IN_PROGRESS")) {
            if (task.getStatus().equals("UNASSIGNED") ||
                    task.getStatus().equals("TODO")) {
                throw new RuntimeException(
                        "Please start the task before submitting. " +
                                "Move status to IN_PROGRESS first."
                );
            }
            if (task.getStatus().equals("IN_REVIEW")) {
                throw new RuntimeException(
                        "Task is already submitted and under review."
                );
            }
            if (task.getStatus().equals("DONE")) {
                throw new RuntimeException(
                        "Task is already completed."
                );
            }
        }

        // 5. validate submission link
        if (!isValidLink(request.getSubmissionLink())) {
            throw new RuntimeException(
                    "Please provide a valid link " +
                            "(github.com, figma.com, docs.google.com etc)"
            );
        }

        // 6. save submission details
        task.setSubmissionLink(request.getSubmissionLink());
        task.setSubmissionNote(request.getSubmissionNote());

        // 7. auto move to IN_REVIEW
        task.setStatus("IN_REVIEW");
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task {} submitted by {} with link {}",
                taskId, userId, request.getSubmissionLink());

        Project project = getProject(task.getProjectId());
        Team team = getTeam(task.getTeamId());

        // 8. notify project leader
        if (project != null && project.getProjectLeaderId() != null) {
            notificationService.sendNotification(
                    project.getProjectLeaderId(),
                    "Task Ready for Review",
                    task.getAssignedToName() + " submitted: " + task.getTitle(),
                    "TASK_SUBMITTED",
                    task.getId(),
                    "TASK"
            );
        }

        return buildTaskResponse(task, project, team);
    }

    // ── Update submission (resubmit after rejection) ─────────────
    public TaskResponse resubmitTask(
            String userId,
            String taskId,
            SubmitTaskRequest request) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. check requester is member of org
        memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. only assigned member can resubmit
        if (task.getAssignedTo() == null ||
                !task.getAssignedTo().equals(userId)) {
            throw new RuntimeException(
                    "Only the assigned member can resubmit this task."
            );
        }

        // 4. task must be IN_PROGRESS
        // (after being rejected and sent back)
        if (!task.getStatus().equals("IN_PROGRESS")) {
            throw new RuntimeException(
                    "Task must be IN_PROGRESS to resubmit. " +
                            "Task was rejected and sent back to IN_PROGRESS."
            );
        }

        // 5. validate link
        if (!isValidLink(request.getSubmissionLink())) {
            throw new RuntimeException(
                    "Please provide a valid link."
            );
        }

        // 6. update submission
        task.setSubmissionLink(request.getSubmissionLink());
        task.setSubmissionNote(request.getSubmissionNote());
        task.setReviewNote(null);   // clear old review note
        task.setReviewedBy(null);   // clear old reviewer

        // 7. move back to IN_REVIEW
        task.setStatus("IN_REVIEW");
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task {} resubmitted by {}", taskId, userId);

        Project project = getProject(task.getProjectId());
        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }

    // ── Validate link helper ─────────────────────────────────────
    private boolean isValidLink(String link) {
        if (link == null || link.isBlank()) return false;
        return link.startsWith("http://") ||
                link.startsWith("https://");
    }

    // ── Review Task ──────────────────────────────────────────────
    public TaskResponse reviewTask(
            String reviewerId,
            String taskId,
            ReviewTaskRequest request) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. find project
        Project project = getProject(task.getProjectId());

        // 3. check reviewer is member of org
        OrganisationMember reviewer = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), reviewerId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can review
        if (!reviewer.getRole().equals("ADMIN") &&
                !reviewer.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can review tasks."
            );
        }

        // 5. project leader can only review
        // tasks in their own project
        if (reviewer.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(reviewerId)) {
            throw new RuntimeException(
                    "You can only review tasks in your own project."
            );
        }

        // 6. task must be IN_REVIEW
        if (!task.getStatus().equals("IN_REVIEW")) {
            if (task.getStatus().equals("DONE")) {
                throw new RuntimeException(
                        "Task is already completed."
                );
            }
            throw new RuntimeException(
                    "Task must be IN_REVIEW status to be reviewed. " +
                            "Current status: " + task.getStatus()
            );
        }

        // 7. validate action
        if (!request.getAction().equals("APPROVE") &&
                !request.getAction().equals("REJECT")) {
            throw new RuntimeException(
                    "Invalid action. Must be APPROVE or REJECT."
            );
        }

        // 8. reject requires a note
        if (request.getAction().equals("REJECT") &&
                (request.getNote() == null ||
                        request.getNote().isBlank())) {
            throw new RuntimeException(
                    "Please provide a reason when rejecting a task."
            );
        }

        // 9. process review
        if (request.getAction().equals("APPROVE")) {

            task.setStatus("DONE");
            task.setReviewNote(request.getNote());
            task.setReviewedBy(reviewerId);
            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("Task {} approved by {}", taskId, reviewerId);

            // notify assigned member
            if (task.getAssignedTo() != null) {
                if (request.getAction().equals("APPROVE")) {
                    notificationService.sendNotification(
                            task.getAssignedTo(),
                            "Task Approved! 🎉",
                            "Your task was approved: " + task.getTitle(),
                            "TASK_REVIEWED",
                            task.getId(),
                            "TASK"
                    );
                } else {
                    notificationService.sendNotification(
                            task.getAssignedTo(),
                            "Task Needs Changes",
                            "Your task was rejected: " + task.getTitle()
                                    + ". Reason: " + request.getNote(),
                            "TASK_REVIEWED",
                            task.getId(),
                            "TASK"
                    );
                }
            }

        } else {

            // REJECT → send back to IN_PROGRESS
            task.setStatus("IN_PROGRESS");
            task.setReviewNote(request.getNote());
            task.setReviewedBy(reviewerId);
            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("Task {} rejected by {} — reason: {}",
                    taskId, reviewerId, request.getNote());
        }

        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }

    // ── Get tasks pending review in project ──────────────────────
    public List<TaskResponse> getTasksPendingReview(
            String projectId, String reviewerId) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check reviewer is ADMIN or PROJECT_LEADER
        OrganisationMember reviewer = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), reviewerId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!reviewer.getRole().equals("ADMIN") &&
                !reviewer.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can view pending reviews."
            );
        }

        // 3. get all IN_REVIEW tasks
        List<Task> tasks = taskRepository
                .findByProjectIdAndStatus(projectId, "IN_REVIEW");

        return tasks.stream()
                .map(task -> {
                    Team team = teamRepository
                            .findById(task.getTeamId())
                            .orElse(null);
                    if (team == null) return null;
                    return buildTaskResponse(task, project, team);
                })
                .filter(t -> t != null)
                .toList();
    }

    // ── Delete Task ──────────────────────────────────────────────
    public void deleteTask(String userId, String taskId) {

        // 1. find task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. find project
        Project project = getProject(task.getProjectId());

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can delete
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can delete tasks."
            );
        }

        // 5. project leader can only delete
        // tasks in their own project
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(userId)) {
            throw new RuntimeException(
                    "You can only delete tasks in your own project."
            );
        }

        // 6. cannot delete IN_PROGRESS task
        if (task.getStatus().equals("IN_PROGRESS")) {
            throw new RuntimeException(
                    "Cannot delete a task that is IN_PROGRESS. " +
                            "Please reassign or wait for completion."
            );
        }

        // 7. cannot delete IN_REVIEW task
        if (task.getStatus().equals("IN_REVIEW")) {
            throw new RuntimeException(
                    "Cannot delete a task that is under review. " +
                            "Please approve or reject it first."
            );
        }

        // 8. delete task
        taskRepository.delete(task);

        log.info("Task {} deleted by {}", taskId, userId);
    }

    // ── Delete all tasks in project ──────────────────────────────
// used when project is deleted
    public void deleteProjectTasks(String projectId) {

        List<Task> tasks = taskRepository
                .findByProjectId(projectId);

        taskRepository.deleteAll(tasks);

        log.info("All tasks deleted for project {}", projectId);
    }

    // ── Delete all tasks in team ─────────────────────────────────
// used when team is deleted
    public void deleteTeamTasks(String teamId) {

        List<Task> tasks = taskRepository
                .findByTeamId(teamId);

        taskRepository.deleteAll(tasks);

        log.info("All tasks deleted for team {}", teamId);
    }

    // ── Unassign all active tasks when member leaves org ─────────
    public void unassignMemberTasks(
            String orgId, String userId) {

        // get all active tasks assigned to user in org
        List<Task> activeTasks = taskRepository
                .findByOrgIdAndAssignedTo(orgId, userId)
                .stream()
                .filter(task ->
                        task.getStatus().equals("TODO") ||
                                task.getStatus().equals("IN_PROGRESS") ||
                                task.getStatus().equals("IN_REVIEW")
                )
                .toList();

        if (activeTasks.isEmpty()) {
            log.info("No active tasks found for user {} in org {}",
                    userId, orgId);
            return;
        }

        // unassign all active tasks
        activeTasks.forEach(task -> {
            String previousStatus = task.getStatus();
            task.setAssignedTo(null);
            task.setAssignedToName(null);
            task.setStatus("UNASSIGNED");
            task.setReviewNote(
                    "Previously assigned member left the organisation. " +
                            "Task needs reassignment."
            );
            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("Task {} unassigned. Was {} assigned to {}",
                    task.getId(), previousStatus, userId);

            // notify leader
            Project project = projectRepository
                    .findById(task.getProjectId())
                    .orElse(null);

            if (project != null &&
                    project.getProjectLeaderId() != null) {
                notificationService.sendNotification(
                        project.getProjectLeaderId(),
                        "Task Needs Reassignment ⚠️",
                        task.getTitle() +
                                " is unassigned. Member left the org.",
                        "TASK_UNASSIGNED",
                        task.getId(),
                        "TASK"
                );
            }
        });

        log.info("{} tasks unassigned for user {} in org {}",
                activeTasks.size(), userId, orgId);
    }

    // ── Unassign tasks when member removed from team ─────────────
    public void unassignTeamMemberTasks(
            String teamId, String userId) {

        // get all active tasks assigned to user in team
        List<Task> activeTasks = taskRepository
                .findByTeamId(teamId)
                .stream()
                .filter(task ->
                        task.getAssignedTo() != null &&
                                task.getAssignedTo().equals(userId) &&
                                (task.getStatus().equals("TODO") ||
                                        task.getStatus().equals("IN_PROGRESS") ||
                                        task.getStatus().equals("IN_REVIEW"))
                )
                .toList();

        if (activeTasks.isEmpty()) {
            log.info("No active tasks for user {} in team {}",
                    userId, teamId);
            return;
        }

        // unassign all
        activeTasks.forEach(task -> {
            task.setAssignedTo(null);
            task.setAssignedToName(null);
            task.setStatus("UNASSIGNED");
            task.setReviewNote(
                    "Previously assigned member left the team. " +
                            "Task needs reassignment."
            );
            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);

            log.info("Task {} unassigned from team member {}",
                    task.getId(), userId);
        });

        log.info("{} tasks unassigned for user {} in team {}",
                activeTasks.size(), userId, teamId);
    }

    // ── Get unassigned tasks summary for leader ──────────────────
    public Map<String, Object> getUnassignedTasksSummary(
            String orgId, String requesterId) {

        // check requester is ADMIN or PROJECT_LEADER
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can view this."
            );
        }

        // get all projects in org
        List<Project> projects = projectRepository
                .findByOrgId(orgId);

        // get unassigned tasks per project
        List<Map<String, Object>> projectSummaries =
                projects.stream()
                        .map(project -> {
                            List<Task> unassigned = taskRepository
                                    .findByProjectIdAndAssignedToIsNull(
                                            project.getId());

                            return Map.of(
                                    "projectId", project.getId(),
                                    "projectName", project.getName(),
                                    "unassignedCount", unassigned.size(),
                                    "tasks", unassigned.stream()
                                            .map(task -> Map.of(
                                                    "taskId", task.getId(),
                                                    "title", task.getTitle(),
                                                    "teamId", task.getTeamId(),
                                                    "priority", task.getPriority(),
                                                    "note", task.getReviewNote() != null
                                                            ? task.getReviewNote() : ""
                                            ))
                                            .toList()
                            );
                        })
                        .filter(s -> (int) s.get("unassignedCount") > 0)
                        .toList();

        return Map.of(
                "orgId", orgId,
                "totalUnassigned", projectSummaries.stream()
                        .mapToInt(s -> (int) s.get("unassignedCount"))
                        .sum(),
                "projects", projectSummaries
        );
    }

    public TaskResponse rescheduleTask(
            String userId, String taskId,
            RescheduleTaskRequest request) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        Project project = getProject(task.getProjectId());

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can reschedule tasks."
            );
        }

        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(userId)) {
            throw new RuntimeException(
                    "You can only reschedule tasks in your own project."
            );
        }

        task.setDueDate(request.getDueDate());

        // THIS is where the reset goes
        task.setReminder3DaySent(false);
        task.setReminder1DaySent(false);
        task.setReminderDueTodaySent(false);
        task.setReminderOverdueSent(false);

        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        log.info("Task {} rescheduled by {}", taskId, userId);

        Team team = getTeam(task.getTeamId());
        return buildTaskResponse(task, project, team);
    }

}