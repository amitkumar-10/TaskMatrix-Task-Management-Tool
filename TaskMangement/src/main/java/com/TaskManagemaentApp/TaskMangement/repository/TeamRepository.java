package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Team;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TeamRepository
        extends MongoRepository<Team, String> {

    List<Team> findByProjectId(String projectId);

    List<Team> findByProjectIdAndStatus(
            String projectId, String status
    );

    boolean existsByProjectIdAndName(
            String projectId, String name
    );
}