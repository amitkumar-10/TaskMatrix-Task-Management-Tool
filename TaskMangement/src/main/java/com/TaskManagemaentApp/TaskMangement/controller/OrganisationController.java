package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.CreateOrgRequest;
import com.TaskManagemaentApp.TaskMangement.dto.MemberResponse;
import com.TaskManagemaentApp.TaskMangement.dto.OrgResponse;
import com.TaskManagemaentApp.TaskMangement.dto.UpdateMemberRoleRequest;
import com.TaskManagemaentApp.TaskMangement.service.OrganisationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/org")
@RequiredArgsConstructor
public class OrganisationController {

    private final OrganisationService organisationService;

    // POST /org/create
    @PostMapping("/create")
    public ResponseEntity<OrgResponse> createOrg(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateOrgRequest request) {

        OrgResponse response = organisationService
                .createOrganisation(userId, request);
        return ResponseEntity.ok(response);
    }

    // GET /org/{orgId}
    @GetMapping("/{orgId}")
    public ResponseEntity<OrgResponse> getOrg(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        OrgResponse response = organisationService
                .getOrganisation(orgId, userId);
        return ResponseEntity.ok(response);
    }


    // GET /org/my
    @GetMapping("/my")
    public ResponseEntity<List<OrgResponse>> getMyOrgs(
            @AuthenticationPrincipal String userId) {

        List<OrgResponse> response = organisationService
                .getMyOrganisations(userId);
        return ResponseEntity.ok(response);
    }



    // get all members of org
    @GetMapping("/{orgId}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId) {

        List<MemberResponse> response = organisationService
                .getOrgMembers(orgId, requesterId);
        return ResponseEntity.ok(response);
    }


    // get single member details
    @GetMapping("/{orgId}/members/{memberId}")
    public ResponseEntity<MemberResponse> getMember(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId,
            @PathVariable String memberId) {

        MemberResponse response = organisationService
                .getMemberDetails(orgId, memberId, requesterId);
        return ResponseEntity.ok(response);
    }


    // get members by role (ADMIN / MEMBER / PROJECT_LEADER)
    @GetMapping("/{orgId}/members/role/{role}")
    public ResponseEntity<List<MemberResponse>> getMembersByRole(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId,
            @PathVariable String role) {

        List<MemberResponse> response = organisationService
                .getMembersByRole(orgId, role, requesterId);
        return ResponseEntity.ok(response);
    }

    // promote or demote member
    @PutMapping("/{orgId}/members/role")
    public ResponseEntity<MemberResponse> updateMemberRole(
            @AuthenticationPrincipal String adminId,
            @PathVariable String orgId,
            @Valid @RequestBody UpdateMemberRoleRequest request) {

        MemberResponse response = organisationService
                .updateMemberRole(orgId, adminId, request);
        return ResponseEntity.ok(response);
    }

    // get all project leaders
    @GetMapping("/{orgId}/leaders")
    public ResponseEntity<List<MemberResponse>> getLeaders(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String orgId) {

        List<MemberResponse> response = organisationService
                .getProjectLeaders(orgId, requesterId);
        return ResponseEntity.ok(response);
    }


    // admin removes a member
    @DeleteMapping("/{orgId}/members/{memberId}")
    public ResponseEntity<?> removeMember(
            @AuthenticationPrincipal String adminId,
            @PathVariable String orgId,
            @PathVariable String memberId) {

        organisationService.removeMember(orgId, adminId, memberId);
        return ResponseEntity.ok(Map.of(
                "message", "Member removed successfully."
        ));
    }


    // member leaves org themselves
    @DeleteMapping("/{orgId}/leave")
    public ResponseEntity<?> leaveOrg(
            @AuthenticationPrincipal String userId,
            @PathVariable String orgId) {

        organisationService.leaveOrganisation(orgId, userId);
        return ResponseEntity.ok(Map.of(
                "message", "You have left the organisation."
        ));
    }


    // transfer admin role to another member
    @PutMapping("/{orgId}/transfer-admin/{newAdminMemberId}")
    public ResponseEntity<MemberResponse> transferAdmin(
            @AuthenticationPrincipal String currentAdminId,
            @PathVariable String orgId,
            @PathVariable String newAdminMemberId) {

        MemberResponse response = organisationService
                .transferAdmin(orgId, currentAdminId, newAdminMemberId);
        return ResponseEntity.ok(response);
    }
}
