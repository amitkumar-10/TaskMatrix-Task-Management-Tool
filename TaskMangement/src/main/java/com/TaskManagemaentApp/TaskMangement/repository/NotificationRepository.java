package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    // get all notifications for user
    List<Notification> findByUserIdOrderByCreatedAtDesc(
            String userId
    );

    // get unread notifications
    List<Notification> findByUserIdAndReadFalse(String userId);

    // count unread
    int countByUserIdAndReadFalse(String userId);
}
