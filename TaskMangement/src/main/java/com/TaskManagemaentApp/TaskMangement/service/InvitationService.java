package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.InvitationCheckResponse;
import com.TaskManagemaentApp.TaskMangement.dto.InvitationResponse;
import com.TaskManagemaentApp.TaskMangement.dto.OrgResponse;
import com.TaskManagemaentApp.TaskMangement.dto.SendInvitationRequest;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import com.TaskManagemaentApp.TaskMangement.repository.InvitationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // frontend base URL for invite link
    private static final String FRONTEND_URL =
            "http://localhost:3000/invite/accept";

    //  Send Invitation
    public InvitationResponse sendInvitation(
            String adminId, SendInvitationRequest request) {

        // 1. check org exists
        Organisation org = organisationRepository
                .findById(request.getOrgId())
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check sender is ADMIN of this org
        OrganisationMember admin = memberRepository
                .findByOrgIdAndUserId(request.getOrgId(), adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!admin.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can send invitations."
            );
        }

        // 3. check if user is already a member
        User existingUser = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (existingUser != null) {
            memberRepository
                    .findByOrgIdAndUserId(
                            request.getOrgId(),
                            existingUser.getId()
                    )
                    .ifPresent(member -> {
                        if (member.getStatus().equals("ACTIVE")) {
                            throw new RuntimeException(
                                    "User is already a member of this organisation."
                            );
                        }
                        // LEFT → allow re-invitation
                    });
        }

        // 4. check if already invited (pending)
        invitationRepository
                .findByOrgIdAndInvitedEmailAndStatus(
                        request.getOrgId(),
                        request.getEmail(),
                        "PENDING"
                )
                .ifPresent(i -> {
                    throw new RuntimeException(
                            "Invitation already sent to this email."
                    );
                });

        // 5. generate unique token
        String token = UUID.randomUUID().toString();

        // 6. save invitation
        Invitation invitation = Invitation.builder()
                .orgId(request.getOrgId())
                .invitedEmail(request.getEmail())
                .invitedUserId(existingUser != null
                        ? existingUser.getId() : null)
                .invitedBy(adminId)
                .token(token)
                .status("PENDING")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        invitationRepository.save(invitation);

        // 7. build invite link
        String inviteLink = FRONTEND_URL + "?token=" + token;

        // 8. get admin name for email
        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException(
                        "Admin not found."
                ));

        // 9. send invitation email
        emailService.sendInvitationEmail(
                request.getEmail(),
                org.getName(),
                adminUser.getName(),
                inviteLink
        );

        log.info("Invitation sent to {} for org {}",
                request.getEmail(), org.getName());

        return buildInvitationResponse(invitation, org.getName());
    }

    // Get pending invitations for org
    public List<InvitationResponse> getPendingInvitations(
            String orgId, String adminId) {

        // check requester is admin
        OrganisationMember member = memberRepository
                .findByOrgIdAndUserId(orgId, adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!member.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can view invitations."
            );
        }

        Organisation org = organisationRepository
                .findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        return invitationRepository
                .findByOrgIdAndStatus(orgId, "PENDING")
                .stream()
                .map(i -> buildInvitationResponse(i, org.getName()))
                .toList();
    }

    // Cancel Invitation
    public void cancelInvitation(String invitationId, String adminId) {

        Invitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new RuntimeException(
                        "Invitation not found."
                ));

        // check requester is admin of that org
        OrganisationMember member = memberRepository
                .findByOrgIdAndUserId(invitation.getOrgId(), adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!member.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can cancel invitations."
            );
        }

        invitation.setStatus("CANCELLED");
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("Invitation {} cancelled by {}", invitationId, adminId);
    }

    //  Build response helper
    private InvitationResponse buildInvitationResponse(
            Invitation invitation, String orgName) {

        return InvitationResponse.builder()
                .id(invitation.getId())
                .orgId(invitation.getOrgId())
                .orgName(orgName)
                .invitedEmail(invitation.getInvitedEmail())
                .invitedBy(invitation.getInvitedBy())
                .status(invitation.getStatus())
                .expiresAt(invitation.getExpiresAt())
                .createdAt(invitation.getCreatedAt())
                .build();
    }



    // ── Check invitation token (frontend calls this first) ───────
    // returns org info + whether user is registered or not
    public InvitationCheckResponse checkInvitation(String token) {

        // 1. find invitation by token
        Invitation invitation = invitationRepository
                .findByToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid invitation link."
                ));

        // 2. check not expired
        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new RuntimeException(
                    "Invitation has expired. Please ask admin to resend."
            );
        }

        // 3. check not already accepted or cancelled
        if (!invitation.getStatus().equals("PENDING")) {
            throw new RuntimeException(
                    "Invitation is no longer valid."
            );
        }

        // 4. check if email is already registered
        boolean isRegistered = userRepository
                .findByEmail(invitation.getInvitedEmail())
                .isPresent();

        // 5. get org name
        Organisation org = organisationRepository
                .findById(invitation.getOrgId())
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        return InvitationCheckResponse.builder()
                .token(token)
                .orgId(invitation.getOrgId())
                .orgName(org.getName())
                .invitedEmail(invitation.getInvitedEmail())
                .isRegistered(isRegistered)
                .status(invitation.getStatus())
                .message(isRegistered
                        ? "Please login to accept invitation."
                        : "Please register to accept invitation."
                )
                .build();
    }

    //  Accept invitation (called after login/register)
    public OrgResponse acceptInvitation(String userId, String token) {

        // 1. find invitation
        Invitation invitation = invitationRepository
                .findByToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid invitation link."
                ));

        // 2. check not expired
        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new RuntimeException(
                    "Invitation has expired. Please ask admin to resend."
            );
        }

        // 3. check still pending
        if (!invitation.getStatus().equals("PENDING")) {
            throw new RuntimeException(
                    "Invitation already used or cancelled."
            );
        }

        // 4. check invited email matches logged in user email
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        if (!user.getEmail().equals(invitation.getInvitedEmail())) {
            throw new RuntimeException(
                    "This invitation was sent to "
                            + invitation.getInvitedEmail()
                            + ". Please login with that email."
            );
        }

        // [MOVED UP] Fetch organization early so we can use it for notifications
        Organisation org = organisationRepository
                .findById(invitation.getOrgId())
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 5. handle member record
        OrganisationMember member = memberRepository
                .findByOrgIdAndUserId(invitation.getOrgId(), userId)
                .orElse(null);

        if (member != null && member.getStatus().equals("ACTIVE")) {
            // already active member
            throw new RuntimeException(
                    "You are already a member of this organisation."
            );

        } else if (member != null && member.getStatus().equals("LEFT")) {
            // re-joining → update existing record
            member.setStatus("ACTIVE");
            member.setRole("MEMBER");
            member.setJoinedAt(LocalDateTime.now());
            member.setUpdatedAt(LocalDateTime.now());
            memberRepository.save(member);

            log.info("User {} re-joined org {}", userId, invitation.getOrgId());

            // Notify admin after re-join save
            if (org.getAdminId() != null) {
                notificationService.sendNotification(
                        org.getAdminId(),
                        "New Member Joined",
                        user.getName() + " joined " + org.getName(),
                        "MEMBER_JOINED",
                        org.getId(),
                        "ORG"
                );
            }

        } else {
            // first time joining → create new record
            OrganisationMember newMember = OrganisationMember.builder()
                    .orgId(invitation.getOrgId())
                    .userId(userId)
                    .role("MEMBER")
                    .status("ACTIVE")
                    .joinedAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            memberRepository.save(newMember);

            log.info("User {} joined org {}", userId, invitation.getOrgId());

            // Notify admin after first-time join save
            if (org.getAdminId() != null) {
                notificationService.sendNotification(
                        org.getAdminId(),
                        "New Member Joined",
                        user.getName() + " joined " + org.getName(),
                        "MEMBER_JOINED",
                        org.getId(),
                        "ORG"
                );
            }
        }

        // 6. mark invitation as ACCEPTED
        invitation.setStatus("ACCEPTED");
        invitation.setInvitedUserId(userId);
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        log.info("User {} accepted invitation to org {}",
                userId, invitation.getOrgId());

        // 7. return org details
        int totalMembers = memberRepository
                .findByOrgIdAndStatus(invitation.getOrgId(), "ACTIVE")
                .size();

        return OrgResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .adminId(org.getAdminId())
                .status(org.getStatus())
                .totalMembers(totalMembers)
                .createdAt(org.getCreatedAt())
                .build();
    }

    //  Resend invitation
    public InvitationResponse resendInvitation(
            String adminId, String invitationId) {

        // 1. find invitation
        Invitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new RuntimeException(
                        "Invitation not found."
                ));

        // 2. check requester is admin
        OrganisationMember admin = memberRepository
                .findByOrgIdAndUserId(invitation.getOrgId(), adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!admin.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can resend invitations."
            );
        }

        // 3. generate new token + reset expiry
        String newToken = UUID.randomUUID().toString();
        invitation.setToken(newToken);
        invitation.setStatus("PENDING");
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // 4. get org + admin details
        Organisation org = organisationRepository
                .findById(invitation.getOrgId())
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException(
                        "Admin not found."
                ));

        // 5. resend email
        String inviteLink =
                "http://localhost:3000/invite/accept?token=" + newToken;

        emailService.sendInvitationEmail(
                invitation.getInvitedEmail(),
                org.getName(),
                adminUser.getName(),
                inviteLink
        );

        log.info("Invitation resent to {}", invitation.getInvitedEmail());

        return buildInvitationResponse(invitation, org.getName());
    }
}
