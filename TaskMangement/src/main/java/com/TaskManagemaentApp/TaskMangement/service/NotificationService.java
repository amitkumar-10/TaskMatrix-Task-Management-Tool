package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.NotificationResponse;
import com.TaskManagemaentApp.TaskMangement.entity.Notification;
import com.TaskManagemaentApp.TaskMangement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Send notification ────────────────────────────────────────
    public void sendNotification(
            String userId,
            String title,
            String message,
            String type,
            String referenceId,
            String referenceType) {

        // 1. save to DB
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // 2. send via WebSocket in real time
        NotificationResponse response = buildResponse(notification);

        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                response
        );

        log.info("Notification sent to user {}: {}",
                userId, title);
    }

    // ── Get all notifications ────────────────────────────────────
    public List<NotificationResponse> getNotifications(
            String userId) {

        log.info("Fetching notifications for userId: {}", userId);

        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        log.info("Found {} notifications", notifications.size());

        return notifications.stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Get unread notifications ─────────────────────────────────
    public List<NotificationResponse> getUnreadNotifications(
            String userId) {

        return notificationRepository
                .findByUserIdAndReadFalse(userId)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Get unread count ─────────────────────────────────────────
    public Map<String, Object> getUnreadCount(String userId) {

        int count = notificationRepository
                .countByUserIdAndReadFalse(userId);

        return Map.of(
                "userId", userId,
                "unreadCount", count
        );
    }

    // ── Mark notification as read ────────────────────────────────
    public void markAsRead(String userId, String notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new RuntimeException(
                        "Notification not found."
                ));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You do not have access to this notification."
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ── Mark all as read ─────────────────────────────────────────
    public void markAllAsRead(String userId) {

        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalse(userId);

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);

        log.info("All notifications marked as read for {}",
                userId);
    }

    // ── Build response ───────────────────────────────────────────
    private NotificationResponse buildResponse(
            Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
