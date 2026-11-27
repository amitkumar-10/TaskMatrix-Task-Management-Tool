package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.PersonalTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workspace")
@RequiredArgsConstructor
public class PersonalTaskController {

    private final PersonalTaskService personalTaskService;

    // POST /workspace/task
    @PostMapping("/task")
    public ResponseEntity<PersonalTaskResponse> createTask(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreatePersonalTaskRequest request) {

        PersonalTaskResponse response = personalTaskService
                .createTask(userId, request);
        return ResponseEntity.ok(response);
    }

    // GET /workspace/tasks
    @GetMapping("/tasks")
    public ResponseEntity<List<PersonalTaskResponse>> getAllTasks(
            @AuthenticationPrincipal String userId) {

        List<PersonalTaskResponse> response = personalTaskService
                .getAllTasks(userId);
        return ResponseEntity.ok(response);
    }

    // GET /workspace/task/{taskId}
    @GetMapping("/task/{taskId}")
    public ResponseEntity<PersonalTaskResponse> getTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId) {

        PersonalTaskResponse response = personalTaskService
                .getTask(userId, taskId);
        return ResponseEntity.ok(response);
    }

    // GET /workspace/tasks/status/{status}
    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<PersonalTaskResponse>> getByStatus(
            @AuthenticationPrincipal String userId,
            @PathVariable String status) {

        List<PersonalTaskResponse> response = personalTaskService
                .getTasksByStatus(userId, status);
        return ResponseEntity.ok(response);
    }

    // GET /workspace/tasks/priority/{priority}
    @GetMapping("/tasks/priority/{priority}")
    public ResponseEntity<List<PersonalTaskResponse>> getByPriority(
            @AuthenticationPrincipal String userId,
            @PathVariable String priority) {

        List<PersonalTaskResponse> response = personalTaskService
                .getTasksByPriority(userId, priority);
        return ResponseEntity.ok(response);
    }

    // GET /workspace/summary
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal String userId) {

        Map<String, Object> response = personalTaskService
                .getWorkspaceSummary(userId);
        return ResponseEntity.ok(response);
    }

    // PUT /workspace/task/{taskId}
    @PutMapping("/task/{taskId}")
    public ResponseEntity<PersonalTaskResponse> updateTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @RequestBody UpdatePersonalTaskRequest request) {

        PersonalTaskResponse response = personalTaskService
                .updateTask(userId, taskId, request);
        return ResponseEntity.ok(response);
    }

    // DELETE /workspace/task/{taskId}
    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<?> deleteTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId) {

        personalTaskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(Map.of(
                "message", "Task deleted successfully."
        ));
    }
}