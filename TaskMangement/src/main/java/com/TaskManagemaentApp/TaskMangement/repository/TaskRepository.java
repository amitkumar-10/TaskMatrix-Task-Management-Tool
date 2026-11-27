package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface TaskRepository
        extends MongoRepository<Task, String> {

    // get all tasks in project
    List<Task> findByProjectId(String projectId);

    // get all tasks in team
    List<Task> findByTeamId(String teamId);

    // get tasks assigned to user
    List<Task> findByAssignedTo(String userId);

    // get tasks by status in project
    List<Task> findByProjectIdAndStatus(
            String projectId, String status
    );

    // get tasks assigned to user in project
    List<Task> findByProjectIdAndAssignedTo(
            String projectId, String userId
    );

    // get unassigned tasks in project
    List<Task> findByProjectIdAndAssignedToIsNull(
            String projectId
    );

    // get tasks by org and assignedTo
    List<Task> findByOrgIdAndAssignedTo(
            String orgId, String userId
    );

    // get tasks by priority in project
    List<Task> findByProjectIdAndPriority(
            String projectId, String priority
    );

    // search by title within project
    @Query("{ 'projectId': ?0, 'title': { $regex: ?1, $options: 'i' } }")
    List<Task> searchByProjectIdAndTitle(String projectId, String query);

    // search by title across whole org
    @Query("{ 'orgId': ?0, 'title': { $regex: ?1, $options: 'i' } }")
    List<Task> searchByOrgIdAndTitle(String orgId, String query);
}