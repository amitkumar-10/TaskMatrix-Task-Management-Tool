package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Invitation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository
        extends MongoRepository<Invitation, String> {

    // find by token (for accepting invite)
    Optional<Invitation> findByToken(String token);

    // check if already invited
    Optional<Invitation> findByOrgIdAndInvitedEmailAndStatus(
            String orgId, String email, String status
    );

    // get all pending invitations for an org
    List<Invitation> findByOrgIdAndStatus(String orgId, String status);

    // get all invitations sent to an email
    List<Invitation> findByInvitedEmail(String email);
}
