package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.NotificationResponse;
import com.TaskManagemaentApp.TaskMangement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /notification/all
    @GetMapping("/all")
    public ResponseEntity<List<NotificationResponse>> getAll(
            @AuthenticationPrincipal String userId) {

        List<NotificationResponse> response = notificationService
                .getNotifications(userId);
        return ResponseEntity.ok(response);
    }

    // GET /notification/unread
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @AuthenticationPrincipal String userId) {

        List<NotificationResponse> response = notificationService
                .getUnreadNotifications(userId);
        return ResponseEntity.ok(response);
    }

    // GET /notification/count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCount(
            @AuthenticationPrincipal String userId) {

        Map<String, Object> response = notificationService
                .getUnreadCount(userId);
        return ResponseEntity.ok(response);
    }

    // PUT /notification/{notificationId}/read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal String userId,
            @PathVariable String notificationId) {

        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.ok(Map.of(
                "message", "Notification marked as read."
        ));
    }

    // PUT /notification/read-all
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @AuthenticationPrincipal String userId) {

        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
                "message", "All notifications marked as read."
        ));
    }
}