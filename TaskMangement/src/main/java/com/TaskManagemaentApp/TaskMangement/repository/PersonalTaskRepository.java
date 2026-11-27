package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.PersonalTask;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PersonalTaskRepository
        extends MongoRepository<PersonalTask, String> {

    // get all tasks of user
    List<PersonalTask> findByUserId(String userId);

    // get tasks by status
    List<PersonalTask> findByUserIdAndStatus(
            String userId, String status
    );

    // get tasks by priority
    List<PersonalTask> findByUserIdAndPriority(
            String userId, String priority
    );

    // count tasks by status
    int countByUserIdAndStatus(
            String userId, String status
    );
}
