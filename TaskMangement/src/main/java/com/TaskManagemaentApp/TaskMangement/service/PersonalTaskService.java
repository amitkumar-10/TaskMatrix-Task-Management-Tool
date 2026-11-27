package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.PersonalTask;
import com.TaskManagemaentApp.TaskMangement.repository.PersonalTaskRepository;
import com.TaskManagemaentApp.TaskMangement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PersonalTaskService {

    private final PersonalTaskRepository personalTaskRepository;
    private final UserRepository userRepository;

    // ── Create Personal Task ─────────────────────────────────────
    public PersonalTaskResponse createTask(
            String userId,
            CreatePersonalTaskRequest request) {

        // 1. check user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        // 2. validate priority
        String priority = request.getPriority() != null
                ? request.getPriority() : "MEDIUM";

        if (!priority.equals("LOW") &&
                !priority.equals("MEDIUM") &&
                !priority.equals("HIGH") &&
                !priority.equals("CRITICAL")) {
            throw new RuntimeException(
                    "Invalid priority. " +
                            "Must be LOW, MEDIUM, HIGH or CRITICAL."
            );
        }

        // 3. create task
        PersonalTask task = PersonalTask.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(priority)
                .status("TODO")
                .note(request.getNote())
                .dueDate(request.getDueDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        personalTaskRepository.save(task);

        log.info("Personal task created for user {}", userId);

        return buildResponse(task);
    }

    // ── Get all tasks ────────────────────────────────────────────
    public List<PersonalTaskResponse> getAllTasks(String userId) {

        return personalTaskRepository
                .findByUserId(userId)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Get single task ──────────────────────────────────────────
    public PersonalTaskResponse getTask(
            String userId, String taskId) {

        PersonalTask task = personalTaskRepository
                .findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // check task belongs to user
        if (!task.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You do not have access to this task."
            );
        }

        return buildResponse(task);
    }

    // ── Get tasks by status ──────────────────────────────────────
    public List<PersonalTaskResponse> getTasksByStatus(
            String userId, String status) {

        if (!status.equals("TODO") &&
                !status.equals("IN_PROGRESS") &&
                !status.equals("DONE")) {
            throw new RuntimeException(
                    "Invalid status. Must be TODO, IN_PROGRESS or DONE."
            );
        }

        return personalTaskRepository
                .findByUserIdAndStatus(userId, status)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Get tasks by priority ────────────────────────────────────
    public List<PersonalTaskResponse> getTasksByPriority(
            String userId, String priority) {

        if (!priority.equals("LOW") &&
                !priority.equals("MEDIUM") &&
                !priority.equals("HIGH") &&
                !priority.equals("CRITICAL")) {
            throw new RuntimeException(
                    "Invalid priority. " +
                            "Must be LOW, MEDIUM, HIGH or CRITICAL."
            );
        }

        return personalTaskRepository
                .findByUserIdAndPriority(userId, priority)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Get workspace summary ────────────────────────────────────
    public Map<String, Object> getWorkspaceSummary(String userId) {

        int total = personalTaskRepository
                .findByUserId(userId).size();
        int todo = personalTaskRepository
                .countByUserIdAndStatus(userId, "TODO");
        int inProgress = personalTaskRepository
                .countByUserIdAndStatus(userId, "IN_PROGRESS");
        int done = personalTaskRepository
                .countByUserIdAndStatus(userId, "DONE");

        return Map.of(
                "userId", userId,
                "totalTasks", total,
                "todo", todo,
                "inProgress", inProgress,
                "done", done,
                "completionRate", total > 0
                        ? (done * 100 / total) + "%" : "0%"
        );
    }

    // ── Update Task ──────────────────────────────────────────────
    public PersonalTaskResponse updateTask(
            String userId,
            String taskId,
            UpdatePersonalTaskRequest request) {

        // 1. find task
        PersonalTask task = personalTaskRepository
                .findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // 2. check task belongs to user
        if (!task.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You do not have access to this task."
            );
        }

        // 3. update title
        if (request.getTitle() != null &&
                !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle());
        }

        // 4. update description
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        // 5. update priority
        if (request.getPriority() != null) {
            if (!request.getPriority().equals("LOW") &&
                    !request.getPriority().equals("MEDIUM") &&
                    !request.getPriority().equals("HIGH") &&
                    !request.getPriority().equals("CRITICAL")) {
                throw new RuntimeException(
                        "Invalid priority."
                );
            }
            task.setPriority(request.getPriority());
        }

        // 6. update status
        if (request.getStatus() != null) {
            if (!request.getStatus().equals("TODO") &&
                    !request.getStatus().equals("IN_PROGRESS") &&
                    !request.getStatus().equals("DONE")) {
                throw new RuntimeException(
                        "Invalid status. " +
                                "Must be TODO, IN_PROGRESS or DONE."
                );
            }
            task.setStatus(request.getStatus());
        }

        // 7. update note
        if (request.getNote() != null) {
            task.setNote(request.getNote());
        }

        // 8. update due date
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        task.setUpdatedAt(LocalDateTime.now());
        personalTaskRepository.save(task);

        log.info("Personal task {} updated by {}",
                taskId, userId);

        return buildResponse(task);
    }

    // ── Delete Task ──────────────────────────────────────────────
    public void deleteTask(String userId, String taskId) {

        PersonalTask task = personalTaskRepository
                .findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        if (!task.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You do not have access to this task."
            );
        }

        personalTaskRepository.delete(task);

        log.info("Personal task {} deleted by {}",
                taskId, userId);
    }

    // ── Build response ───────────────────────────────────────────
    private PersonalTaskResponse buildResponse(
            PersonalTask task) {

        return PersonalTaskResponse.builder()
                .id(task.getId())
                .userId(task.getUserId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .note(task.getNote())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}