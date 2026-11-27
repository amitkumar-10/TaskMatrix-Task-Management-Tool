package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invitation")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // POST /invitation/send
    @PostMapping("/send")
    public ResponseEntity<InvitationResponse> sendInvitation(
            @AuthenticationPrincipal String adminId,
            @Valid @RequestBody SendInvitationRequest request) {

        InvitationResponse response = invitationService
                .sendInvitation(adminId, request);
        return ResponseEntity.ok(response);
    }

    // GET /invitation/pending/{orgId}
    @GetMapping("/pending/{orgId}")
    public ResponseEntity<List<InvitationResponse>> getPending(
            @AuthenticationPrincipal String adminId,
            @PathVariable String orgId) {

        List<InvitationResponse> response = invitationService
                .getPendingInvitations(orgId, adminId);
        return ResponseEntity.ok(response);
    }

    // DELETE /invitation/cancel/{invitationId}
    @DeleteMapping("/cancel/{invitationId}")
    public ResponseEntity<?> cancelInvitation(
            @AuthenticationPrincipal String adminId,
            @PathVariable String invitationId) {

        invitationService.cancelInvitation(invitationId, adminId);
        return ResponseEntity.ok(Map.of(
                "message", "Invitation cancelled successfully."
        ));
    }

    // GET /invitation/check?token=abc123
    // called by frontend when user clicks invite link
    @GetMapping("/check")
    public ResponseEntity<InvitationCheckResponse> checkInvitation(
            @RequestParam String token) {

        InvitationCheckResponse response = invitationService
                .checkInvitation(token);
        return ResponseEntity.ok(response);
    }

    // POST /invitation/accept
    // called after user logs in or registers
    // JWT required
    @PostMapping("/accept")
    public ResponseEntity<OrgResponse> acceptInvitation(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AcceptInvitationRequest request) {

        OrgResponse response = invitationService
                .acceptInvitation(userId, request.getToken());
        return ResponseEntity.ok(response);
    }

    // POST /invitation/resend/{invitationId}
    @PostMapping("/resend/{invitationId}")
    public ResponseEntity<InvitationResponse> resendInvitation(
            @AuthenticationPrincipal String adminId,
            @PathVariable String invitationId) {

        InvitationResponse response = invitationService
                .resendInvitation(adminId, invitationId);
        return ResponseEntity.ok(response);
    }
}