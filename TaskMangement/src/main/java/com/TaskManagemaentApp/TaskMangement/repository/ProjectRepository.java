package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ProjectRepository
        extends MongoRepository<Project, String> {

    // get all projects in org
    List<Project> findByOrgId(String orgId);

    // get all projects in org by status
    List<Project> findByOrgIdAndStatus(String orgId, String status);

    // get projects by leader
    List<Project> findByOrgIdAndProjectLeaderId(
            String orgId, String projectLeaderId
    );

    // case-insensitive search by name within org
    @Query("{ 'orgId': ?0, 'name': { $regex: ?1, $options: 'i' } }")
    List<Project> searchByOrgIdAndName(String orgId, String query);

    // check name exists in org
    boolean existsByOrgIdAndName(String orgId, String name);
}