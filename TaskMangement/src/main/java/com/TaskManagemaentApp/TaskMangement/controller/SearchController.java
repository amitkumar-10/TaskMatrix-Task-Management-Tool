package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // GET /search/org/{orgId}?q=login
    @GetMapping("/org/{orgId}")
    public ResponseEntity<SearchResponse> searchInOrg(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId,
            @RequestParam("q") String query) {

        SearchResponse response = searchService
                .searchInOrg(orgId, query, userId);
        return ResponseEntity.ok(response);
    }

    // GET /search/project/{projectId}/tasks?q=login
    @GetMapping("/project/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> searchTasksInProject(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId,
            @RequestParam("q") String query) {

        List<TaskResponse> response = searchService
                .searchTasksInProject(projectId, query, userId);
        return ResponseEntity.ok(response);
    }
}