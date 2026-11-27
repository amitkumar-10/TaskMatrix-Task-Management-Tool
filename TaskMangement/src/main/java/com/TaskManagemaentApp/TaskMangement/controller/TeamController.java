package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/team")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    // POST /team/create
    @PostMapping("/create")
    public ResponseEntity<TeamResponse> createTeam(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateTeamRequest request) {

        TeamResponse response = teamService
                .createTeam(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/members/add")
    public ResponseEntity<TeamMemberResponse> addMember(
            @AuthenticationPrincipal String requesterId,
            @Valid @RequestBody AddTeamMemberRequest request) {

        TeamMemberResponse response = teamService
                .addTeamMember(requesterId, request);
        return ResponseEntity.ok(response);
    }


    // get all teams in project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TeamResponse>> getProjectTeams(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        List<TeamResponse> response = teamService
                .getProjectTeams(projectId, userId);
        return ResponseEntity.ok(response);
    }


    // get single team
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamResponse> getTeam(
            @AuthenticationPrincipal String userId,
            @PathVariable String teamId) {

        TeamResponse response = teamService
                .getTeam(teamId, userId);
        return ResponseEntity.ok(response);
    }


    // get all members of team
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @AuthenticationPrincipal String userId,
            @PathVariable String teamId) {

        List<TeamMemberResponse> response = teamService
                .getTeamMembers(teamId, userId);
        return ResponseEntity.ok(response);
    }


    // get my teams in project
    @GetMapping("/project/{projectId}/my")
    public ResponseEntity<List<TeamResponse>> getMyTeams(
            @AuthenticationPrincipal String userId,
            @PathVariable String projectId) {

        List<TeamResponse> response = teamService
                .getMyTeams(projectId, userId);
        return ResponseEntity.ok(response);
    }

    // DELETE /team/{teamId}/members/{userId}
// admin or leader removes a member
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String teamId,
            @PathVariable String userId) {

        teamService.removeTeamMember(requesterId, teamId, userId);
        return ResponseEntity.ok(Map.of(
                "message", "Member removed from team successfully."
        ));
    }

    // member leaves team themselves
    @DeleteMapping("/{teamId}/leave")
    public ResponseEntity<?> leaveTeam(
            @AuthenticationPrincipal String userId,
            @PathVariable String teamId) {

        teamService.leaveTeam(userId, teamId);
        return ResponseEntity.ok(Map.of(
                "message", "You have left the team."
        ));
    }

    // update team
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String teamId,
            @RequestBody UpdateTeamRequest request) {

        TeamResponse response = teamService
                .updateTeam(requesterId, teamId, request);
        return ResponseEntity.ok(response);
    }

    // delete team
    @DeleteMapping("/{teamId}")
    public ResponseEntity<?> deleteTeam(
            @AuthenticationPrincipal String requesterId,
            @PathVariable String teamId) {

        teamService.deleteTeam(requesterId, teamId);
        return ResponseEntity.ok(Map.of(
                "message", "Team deleted successfully."
        ));
    }
}