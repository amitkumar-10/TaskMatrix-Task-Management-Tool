package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.MemberDashboardResponse;
import com.TaskManagemaentApp.TaskMangement.dto.OrgDashboardResponse;
import com.TaskManagemaentApp.TaskMangement.dto.ProjectDashboardResponse;
import com.TaskManagemaentApp.TaskMangement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // GET /dashboard/org/{orgId}
    @GetMapping("/org/{orgId}")
    public ResponseEntity<OrgDashboardResponse> getOrgDashboard(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        OrgDashboardResponse response = dashboardService
                .getOrgDashboard(orgId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /dashboard/project/{projectId}
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectDashboardResponse> getProjectDashboard(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        ProjectDashboardResponse response = dashboardService
                .getProjectDashboard(projectId, userId);
        return ResponseEntity.ok(response);
    }

    // GET /dashboard/member/{orgId}/{targetUserId}
    @GetMapping("/member/{orgId}/{targetUserId}")
    public ResponseEntity<MemberDashboardResponse> getMemberDashboard(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId,
            @PathVariable String targetUserId) {

        MemberDashboardResponse response = dashboardService
                .getMemberDashboard(orgId, targetUserId, requesterId);
        return ResponseEntity.ok(response);
    }

    // GET /dashboard/member/{orgId}/me
    // shortcut for viewing your own dashboard
    @GetMapping("/member/{orgId}/me")
    public ResponseEntity<MemberDashboardResponse> getMyDashboard(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId) {

        MemberDashboardResponse response = dashboardService
                .getMemberDashboard(orgId, requesterId, requesterId);
        return ResponseEntity.ok(response);
    }

}