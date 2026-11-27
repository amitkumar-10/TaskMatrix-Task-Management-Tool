package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    // POST /task/create
    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateTaskRequest request) {

        TaskResponse response = taskService
                .createTask(userId, request);
        return ResponseEntity.ok(response);
    }

    // GET /task/{taskId}
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId) {

        TaskResponse response = taskService.getTask(taskId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /task/project/{projectId}
    // all tasks in project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        List<TaskResponse> response = taskService
                .getProjectTasks(projectId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /task/team/{teamId}
    // all tasks in team
    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TaskResponse>> getTeamTasks(
            @AuthenticationPrincipal String userId,
            @PathVariable String teamId) {

        List<TaskResponse> response = taskService
                .getTeamTasks(teamId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /task/my/{orgId}
    // my assigned tasks in org
    @GetMapping("/my/{orgId}")
    public ResponseEntity<List<TaskResponse>> getMyTasks(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        List<TaskResponse> response = taskService
                .getMyTasks(orgId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /task/project/{projectId}/status/{status}
    // tasks by status
    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<TaskResponse>> getByStatus(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId,
            @PathVariable String status) {

        List<TaskResponse> response = taskService
                .getTasksByStatus(projectId, status, userId);
        return ResponseEntity.ok(response);
    }

    // GET /task/project/{projectId}/unassigned
    // unassigned tasks
    @GetMapping("/project/{projectId}/unassigned")
    public ResponseEntity<List<TaskResponse>> getUnassigned(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        List<TaskResponse> response = taskService
                .getUnassignedTasks(projectId, userId);
        return ResponseEntity.ok(response);
    }
    // PUT /task/{taskId}/assign
    @PutMapping("/{taskId}/assign")
    public ResponseEntity<TaskResponse> assignTask(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String taskId,
            @Valid @RequestBody AssignTaskRequest request) {

        TaskResponse response = taskService
                .assignTask(requesterId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // PUT /task/{taskId}/unassign
    @PutMapping("/{taskId}/unassign")
    public ResponseEntity<TaskResponse> unassignTask(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String taskId) {

        TaskResponse response = taskService
                .unassignTask(requesterId, taskId);
        return ResponseEntity.ok(response);
    }

    // PUT /task/{taskId}/status
    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        TaskResponse response = taskService
                .updateTaskStatus(userId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // POST /task/{taskId}/submit
    @PostMapping("/{taskId}/submit")
    public ResponseEntity<TaskResponse> submitTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @Valid @RequestBody SubmitTaskRequest request) {

        TaskResponse response = taskService
                .submitTask(userId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // POST /task/{taskId}/resubmit
    @PostMapping("/{taskId}/resubmit")
    public ResponseEntity<TaskResponse> resubmitTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @Valid @RequestBody SubmitTaskRequest request) {

        TaskResponse response = taskService
                .resubmitTask(userId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // POST /task/{taskId}/review
    @PostMapping("/{taskId}/review")
    public ResponseEntity<TaskResponse> reviewTask(
            @AuthenticationPrincipal String reviewerId,
            @PathVariable String taskId,
            @Valid @RequestBody ReviewTaskRequest request) {

        TaskResponse response = taskService
                .reviewTask(reviewerId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // GET /task/project/{projectId}/pending-review
    @GetMapping("/project/{projectId}/pending-review")
    public ResponseEntity<List<TaskResponse>> getPendingReview(
            @AuthenticationPrincipal String reviewerId,
            @PathVariable String projectId) {

        List<TaskResponse> response = taskService
                .getTasksPendingReview(projectId, reviewerId);
        return ResponseEntity.ok(response);
    }

    // DELETE /task/{taskId}
    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId) {

        taskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(Map.of(
                "message", "Task deleted successfully."
        ));
    }

    // GET /task/unassigned/summary/{orgId}
    @GetMapping("/unassigned/summary/{orgId}")
    public ResponseEntity<Map<String, Object>> getUnassignedSummary(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId) {

        Map<String, Object> response = taskService
                .getUnassignedTasksSummary(orgId, requesterId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{taskId}/reschedule")
    public ResponseEntity<TaskResponse> rescheduleTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @RequestBody RescheduleTaskRequest request) {

        TaskResponse response = taskService
                .rescheduleTask(userId, taskId, request);
        return ResponseEntity.ok(response);
    }
}