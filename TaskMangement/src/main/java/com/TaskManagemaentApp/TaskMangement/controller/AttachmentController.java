package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.AttachmentResponse;
import com.TaskManagemaentApp.TaskMangement.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attachment")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    // POST /attachment/task/{taskId}
    @PostMapping(value = "/task/{taskId}",
            consumes = "multipart/form-data")
    public ResponseEntity<AttachmentResponse> uploadToTask(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId,
            @RequestParam("file") MultipartFile file) {

        AttachmentResponse response = attachmentService
                .uploadTaskAttachment(userId, taskId, file);
        return ResponseEntity.ok(response);
    }

    // POST /attachment/project/{projectId}
    @PostMapping(value = "/project/{projectId}",
            consumes = "multipart/form-data")
    public ResponseEntity<AttachmentResponse> uploadToProject(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId,
            @RequestParam("file") MultipartFile file) {

        AttachmentResponse response = attachmentService
                .uploadProjectAttachment(userId, projectId, file);
        return ResponseEntity.ok(response);
    }

    // GET /attachment/task/{taskId}
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<AttachmentResponse>> getTaskAttachments(
            @AuthenticationPrincipal String userId,
            @PathVariable String taskId) {

        List<AttachmentResponse> response = attachmentService
                .getAttachments(taskId, "TASK", userId);
        return ResponseEntity.ok(response);
    }

    // GET /attachment/project/{projectId}
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<AttachmentResponse>> getProjectAttachments(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        List<AttachmentResponse> response = attachmentService
                .getAttachments(projectId, "PROJECT", userId);
        return ResponseEntity.ok(response);
    }

    // DELETE /attachment/{attachmentId}
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(
            @AuthenticationPrincipal String userId,
            @PathVariable String attachmentId) {

        attachmentService.deleteAttachment(userId, attachmentId);
        return ResponseEntity.ok(Map.of(
                "message", "Attachment deleted successfully."
        ));
    }
}