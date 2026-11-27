package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.TeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository
        extends MongoRepository<TeamMember, String> {

    // get all active members of a team
    List<TeamMember> findByTeamIdAndStatus(
            String teamId, String status
    );

    // check if user already in team
    boolean existsByTeamIdAndUserId(
            String teamId, String userId
    );

    // find specific team member record
    Optional<TeamMember> findByTeamIdAndUserId(
            String teamId, String userId
    );

    // get all teams a user belongs to in a project
    List<TeamMember> findByProjectIdAndUserId(
            String projectId, String userId
    );

    // get all team members in org
    List<TeamMember> findByOrgIdAndUserId(
            String orgId, String userId
    );
}