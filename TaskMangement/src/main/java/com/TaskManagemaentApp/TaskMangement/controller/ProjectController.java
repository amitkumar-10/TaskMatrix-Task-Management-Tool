package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // POST /project/create
    @PostMapping("/create")
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectResponse response = projectService.createProject(userId, request);

        return ResponseEntity.ok(response);
    }

    // get single project
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        ProjectResponse response = projectService
                .getProject(projectId, userId);
        return ResponseEntity.ok(response);
    }

    // get all projects in org
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProjectResponse>> getOrgProjects(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        List<ProjectResponse> response = projectService
                .getOrgProjects(orgId, userId);
        return ResponseEntity.ok(response);
    }

    // get projects by status
    @GetMapping("/org/{orgId}/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getByStatus(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId,
            @PathVariable String status) {

        List<ProjectResponse> response = projectService
                .getProjectsByStatus(orgId, status, userId);
        return ResponseEntity.ok(response);
    }

    // get projects where I am leader
    @GetMapping("/org/{orgId}/my")
    public ResponseEntity<List<ProjectResponse>> getMyProjects(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        List<ProjectResponse> response = projectService
                .getMyProjects(orgId, userId);
        return ResponseEntity.ok(response);
    }

    // PUT /project/{projectId}
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId,
            @RequestBody UpdateProjectRequest request) {

        ProjectResponse response = projectService
                .updateProject(projectId, userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        projectService.deleteProject(projectId, userId);
        return ResponseEntity.ok(Map.of(
                "message", "Project deleted successfully."
        ));
    }
}