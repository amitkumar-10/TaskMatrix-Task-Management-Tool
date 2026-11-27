package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.CreateOrgRequest;
import com.TaskManagemaentApp.TaskMangement.dto.MemberResponse;
import com.TaskManagemaentApp.TaskMangement.dto.OrgResponse;
import com.TaskManagemaentApp.TaskMangement.dto.UpdateMemberRoleRequest;
import com.TaskManagemaentApp.TaskMangement.entity.Organisation;
import com.TaskManagemaentApp.TaskMangement.entity.OrganisationMember;
import com.TaskManagemaentApp.TaskMangement.entity.User;
import com.TaskManagemaentApp.TaskMangement.repository.OrganisationMemberRepository;
import com.TaskManagemaentApp.TaskMangement.repository.OrganisationRepository;
import com.TaskManagemaentApp.TaskMangement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final NotificationService notificationService;

    //  Create Organisation
    public OrgResponse createOrganisation(
            String adminId, CreateOrgRequest request) {

        // 1. check org name already exists
        if (organisationRepository.existsByName(request.getName())) {
            throw new RuntimeException(
                    "Organisation name already taken."
            );
        }

        // 2. create org
        Organisation org = Organisation.builder()
                .name(request.getName())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .adminId(adminId)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        organisationRepository.save(org);

        // 3. add creator as ADMIN member
        OrganisationMember adminMember = OrganisationMember.builder()
                .orgId(org.getId())
                .userId(adminId)
                .role("ADMIN")
                .status("ACTIVE")
                .joinedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        memberRepository.save(adminMember);

        log.info("Organisation created: {} by {}", org.getName(), adminId);

        // pass adminId so userRole = ADMIN in response
        return buildOrgResponse(org, adminId);
    }

    // Get Organisation by ID
    public OrgResponse getOrganisation(String orgId, String userId) {

        Organisation org = organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        return buildOrgResponse(org, userId);
    }

    // Get all orgs of a user
    public List<OrgResponse> getMyOrganisations(String userId) {

        List<OrganisationMember> memberships =
                memberRepository.findByUserId(userId);

        return memberships.stream()
                .map(m -> organisationRepository
                        .findById(m.getOrgId())
                        .map(org -> buildOrgResponse(org, userId))
                        .orElse(null))
                .filter(o -> o != null)
                .toList();
    }

    //  Build response helper
    private OrgResponse buildOrgResponse(Organisation org, String userId) {

        int totalMembers = memberRepository
                .findByOrgIdAndStatus(org.getId(), "ACTIVE")
                .size();

        String userRole = memberRepository
                .findByOrgIdAndUserId(org.getId(), userId)
                .map(OrganisationMember::getRole)
                .orElse("MEMBER"); // Fallback default

        return OrgResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .description(org.getDescription())
                .adminId(org.getAdminId())
                .avatarUrl(org.getAvatarUrl())
                .status(org.getStatus())
                .totalMembers(totalMembers)
                .userRole(userRole)
                .createdAt(org.getCreatedAt())
                .build();
    }

    // ── Get all active members of org ───────────────────────────
    public List<MemberResponse> getOrgMembers(
            String orgId, String requesterId) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is member of org
        memberRepository.findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. get all active members
        List<OrganisationMember> members = memberRepository
                .findByOrgIdAndStatus(orgId, "ACTIVE");

        // 4. build response with user details
        return members.stream()
                .map(m -> {
                    User user = userRepository
                            .findById(m.getUserId())
                            .orElse(null);

                    if (user == null) return null;

                    return MemberResponse.builder()
                            .memberId(m.getId())
                            .userId(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .avatarUrl(user.getAvatarUrl())
                            .role(m.getRole())
                            .status(m.getStatus())
                            .userRoles(user.getRoles())
                            .joinedAt(m.getJoinedAt())
                            .build();
                })
                .filter(m -> m != null)
                .toList();
    }



    //  Get single member details
    public MemberResponse getMemberDetails(
            String orgId, String memberId, String requesterId) {

        // 1. check requester is member of org
        memberRepository.findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 2. find the member record
        OrganisationMember member = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new RuntimeException(
                        "Member not found."
                ));

        // 3. get user details
        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        return MemberResponse.builder()
                .memberId(member.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(member.getRole())
                .status(member.getStatus())
                .userRoles(user.getRoles())
                .joinedAt(member.getJoinedAt())
                .build();
    }

    //  Get members by role
    public List<MemberResponse> getMembersByRole(
            String orgId, String role, String requesterId) {

        // 1. check requester is member
        memberRepository.findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 2. get all active members
        List<OrganisationMember> members = memberRepository
                .findByOrgIdAndStatusAndRole(orgId, "ACTIVE", role);

        // 3. filter by role
        return members.stream()
                .filter(m -> m.getRole().equals(role))
                .map(m -> {
                    User user = userRepository
                            .findById(m.getUserId())
                            .orElse(null);

                    if (user == null) return null;

                    return MemberResponse.builder()
                            .memberId(m.getId())
                            .userId(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .avatarUrl(user.getAvatarUrl())
                            .role(m.getRole())
                            .status(m.getStatus())
                            .userRoles(user.getRoles())
                            .joinedAt(m.getJoinedAt())
                            .build();
                })
                .filter(m -> m != null)
                .toList();
    }

    //  Promote / Demote member role
    public MemberResponse updateMemberRole(
            String orgId,
            String adminId,
            UpdateMemberRoleRequest request) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is ADMIN
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can update member roles."
            );
        }

        // 3. find target member
        OrganisationMember targetMember = memberRepository
                .findById(request.getMemberId())
                .orElseThrow(() -> new RuntimeException(
                        "Member not found."
                ));

        // 4. check target member belongs to same org
        if (!targetMember.getOrgId().equals(orgId)) {
            throw new RuntimeException(
                    "Member does not belong to this organisation."
            );
        }

        // 5. admin cannot change their own role
        if (targetMember.getUserId().equals(adminId)) {
            throw new RuntimeException(
                    "You cannot change your own role."
            );
        }

        // 6. validate role value
        if (!request.getRole().equals("MEMBER") &&
                !request.getRole().equals("PROJECT_LEADER") &&
                !request.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Invalid role. Must be MEMBER, PROJECT_LEADER or ADMIN."
            );
        }

        // 7. check if already has same role
        if (targetMember.getRole().equals(request.getRole())) {
            throw new RuntimeException(
                    "Member already has role: " + request.getRole()
            );
        }

        // 8. update role
        String oldRole = targetMember.getRole();
        targetMember.setRole(request.getRole());
        targetMember.setUpdatedAt(LocalDateTime.now());
        memberRepository.save(targetMember);

        log.info("Member {} role updated from {} to {} in org {}",
                targetMember.getUserId(), oldRole,
                request.getRole(), orgId);

        // 9. get user details for response
        User user = userRepository
                .findById(targetMember.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        return MemberResponse.builder()
                .memberId(targetMember.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(targetMember.getRole())
                .status(targetMember.getStatus())
                .userRoles(user.getRoles())
                .joinedAt(targetMember.getJoinedAt())
                .build();
    }

    //  Get all project leaders of org
    public List<MemberResponse> getProjectLeaders(
            String orgId, String requesterId) {

        // 1. check requester is member
        memberRepository.findByOrgIdAndUserId(orgId, requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 2. get all project leaders
        List<OrganisationMember> leaders = memberRepository
                .findByOrgIdAndStatusAndRole(orgId, "ACTIVE", "PROJECT_LEADER");

        // 3. build response
        return leaders.stream()
                .map(m -> {
                    User user = userRepository
                            .findById(m.getUserId())
                            .orElse(null);

                    if (user == null) return null;

                    return MemberResponse.builder()
                            .memberId(m.getId())
                            .userId(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .avatarUrl(user.getAvatarUrl())
                            .role(m.getRole())
                            .status(m.getStatus())
                            .userRoles(user.getRoles())
                            .joinedAt(m.getJoinedAt())
                            .build();
                })
                .filter(m -> m != null)
                .toList();
    }

    // ── Remove member from org ───────────────────────────────────
    public void removeMember(
            String orgId,
            String adminId,
            String memberId) {

        // 1. check org exists
        Organisation org = organisationRepository
                .findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is ADMIN
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, adminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can remove members."
            );
        }

        // 3. find target member
        OrganisationMember targetMember = memberRepository
                .findById(memberId)
                .orElseThrow(() -> new RuntimeException(
                        "Member not found."
                ));

        // 4. check target belongs to same org
        if (!targetMember.getOrgId().equals(orgId)) {
            throw new RuntimeException(
                    "Member does not belong to this organisation."
            );
        }

        // 5. admin cannot remove themselves
        if (targetMember.getUserId().equals(adminId)) {
            throw new RuntimeException(
                    "You cannot remove yourself from the organisation."
            );
        }

        // 6. cannot remove another ADMIN
        if (targetMember.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Cannot remove an admin. Demote to member first."
            );
        }

        // 7. unassign all active tasks
        taskService.unassignMemberTasks(
                orgId, targetMember.getUserId()
        );

        // 8. mark as LEFT
        targetMember.setStatus("LEFT");
        targetMember.setUpdatedAt(LocalDateTime.now());
        memberRepository.save(targetMember);

        // 9. notify removed member
        notificationService.sendNotification(
                targetMember.getUserId(),
                "Removed from Organisation",
                "You have been removed from " + org.getName(),
                "MEMBER_LEFT",
                orgId,
                "ORG"
        );

        log.info("Member {} removed from org {} by admin {}",
                memberId, orgId, adminId);
    }

    // ── Leave organisation (member leaves themselves) ────────────
    public void leaveOrganisation(String orgId, String userId) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. find member record
        OrganisationMember member = memberRepository
                .findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. admin cannot leave their own org
        if (member.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Admin cannot leave the organisation. " +
                            "Transfer admin role to another member first."
            );
        }

        // unassign all active tasks
        taskService.unassignMemberTasks(orgId, userId);

        // 4. mark as LEFT
        member.setStatus("LEFT");
        member.setUpdatedAt(LocalDateTime.now());
        memberRepository.save(member);

        log.info("User {} left org {}", userId, orgId);
    }

    // ── Transfer admin role ──────────────────────────────────────
    public MemberResponse transferAdmin(
            String orgId,
            String currentAdminId,
            String newAdminMemberId) {

        // 1. check org exists
        Organisation org = organisationRepository
                .findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is ADMIN
        OrganisationMember currentAdmin = memberRepository
                .findByOrgIdAndUserId(orgId, currentAdminId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!currentAdmin.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can transfer admin role."
            );
        }

        // 3. find new admin member
        OrganisationMember newAdmin = memberRepository
                .findById(newAdminMemberId)
                .orElseThrow(() -> new RuntimeException(
                        "Member not found."
                ));

        // 4. check belongs to same org
        if (!newAdmin.getOrgId().equals(orgId)) {
            throw new RuntimeException(
                    "Member does not belong to this organisation."
            );
        }

        // 5. cannot transfer to yourself
        if (newAdmin.getUserId().equals(currentAdminId)) {
            throw new RuntimeException(
                    "You are already the admin."
            );
        }

        // 6. demote current admin to MEMBER
        currentAdmin.setRole("MEMBER");
        currentAdmin.setUpdatedAt(LocalDateTime.now());
        memberRepository.save(currentAdmin);

        // 7. promote new admin
        newAdmin.setRole("ADMIN");
        newAdmin.setUpdatedAt(LocalDateTime.now());
        memberRepository.save(newAdmin);

        // 8. update org adminId
        org.setAdminId(newAdmin.getUserId());
        org.setUpdatedAt(LocalDateTime.now());
        organisationRepository.save(org);

        log.info("Admin transferred from {} to {} in org {}",
                currentAdminId, newAdmin.getUserId(), orgId);

        // 9. return new admin details
        User user = userRepository
                .findById(newAdmin.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found."
                ));

        return MemberResponse.builder()
                .memberId(newAdmin.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(newAdmin.getRole())
                .status(newAdmin.getStatus())
                .userRoles(user.getRoles())
                .joinedAt(newAdmin.getJoinedAt())
                .build();
    }


}