package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.OrganisationMember;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrganisationMemberRepository
        extends MongoRepository<OrganisationMember, String> {

    // check if user is already member of org
    boolean existsByOrgIdAndUserId(String orgId, String userId);

    // find single member record by orgId + userId
    Optional<OrganisationMember> findByOrgIdAndUserId(
            String orgId, String userId
    );

    // get all members of org filtered by status
    // usage: findByOrgIdAndStatus(orgId, "ACTIVE")
    List<OrganisationMember> findByOrgIdAndStatus(
            String orgId, String status
    );

    // get all orgs a user belongs to
    List<OrganisationMember> findByUserId(String userId);

    // get members filtered by status AND role
    // usage: findByOrgIdAndStatusAndRole(orgId, "ACTIVE", "PROJECT_LEADER")
    // this replaces findByOrgIdAndRole — always filter by status too
    List<OrganisationMember> findByOrgIdAndStatusAndRole(
            String orgId, String status, String role
    );
}