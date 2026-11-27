package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;


    // ── Create Team ──────────────────────────────────────────────
    public TeamResponse createTeam(String userId, CreateTeamRequest request) {
        // find project
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found."));

        // check requester is member of org
        OrganisationMember requester = memberRepository.findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        // only ADMIN or PROJECT_LEADER can create team
        if (!"ADMIN".equals(requester.getRole()) && !"PROJECT_LEADER".equals(requester.getRole())) {
            throw new RuntimeException("Only admins or project leaders can create teams.");
        }

        // project leader can only create team in their own project
        if ("PROJECT_LEADER".equals(requester.getRole()) && !userId.equals(project.getProjectLeaderId())) {
            throw new RuntimeException("You can only create teams in your own project.");
        }

        // check team name unique in project
        if (teamRepository.existsByProjectIdAndName(request.getProjectId(), request.getName())) {
            throw new RuntimeException("Team name already exists in this project.");
        }

        // create team
        Team team = Team.builder()
                .orgId(project.getOrgId())
                .projectId(request.getProjectId())
                .name(request.getName())
                .description(request.getDescription())
                .status("ACTIVE")
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teamRepository.save(team);
        log.info("Team {} created in project {} by {}", team.getName(), request.getProjectId(), userId);

        return buildTeamResponse(team, project.getName());
    }

    // ── Build team response ──────────────────────────────────────
    private TeamResponse buildTeamResponse(Team team, String projectName) {
        String createdByName = userRepository.findById(team.getCreatedBy())
                .map(User::getName)
                .orElse("Unknown");

        int totalMembers = teamMemberRepository.findByTeamIdAndStatus(team.getId(), "ACTIVE").size();

        return TeamResponse.builder()
                .id(team.getId())
                .orgId(team.getOrgId())
                .projectId(team.getProjectId())
                .projectName(projectName)
                .name(team.getName())
                .description(team.getDescription())
                .status(team.getStatus())
                .createdBy(team.getCreatedBy())
                .createdByName(createdByName)
                .totalMembers(totalMembers)
                .createdAt(team.getCreatedAt())
                .build();
    }

    // ── Add member to team ───────────────────────────────────────
    public TeamMemberResponse addTeamMember(String requesterId, AddTeamMemberRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found."));

        Project project = projectRepository.findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found."));

        OrganisationMember requester = memberRepository.findByOrgIdAndUserId(team.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        if (!"ADMIN".equals(requester.getRole()) && !"PROJECT_LEADER".equals(requester.getRole())) {
            throw new RuntimeException("Only admins or project leaders can add team members.");
        }

        if ("PROJECT_LEADER".equals(requester.getRole()) && !requesterId.equals(project.getProjectLeaderId())) {
            throw new RuntimeException("You can only add members to your own project teams.");
        }

        OrganisationMember targetMember = memberRepository.findByOrgIdAndUserId(team.getOrgId(), request.getUserId())
                .orElseThrow(() -> new RuntimeException("User is not a member of this organisation."));

        if (!"ACTIVE".equals(targetMember.getStatus())) {
            throw new RuntimeException("User is not an active member of this organisation.");
        }

        if (teamMemberRepository.existsByTeamIdAndUserId(request.getTeamId(), request.getUserId())) {
            TeamMember existing = teamMemberRepository.findByTeamIdAndUserId(request.getTeamId(), request.getUserId())
                    .orElse(null);

            if (existing != null && "ACTIVE".equals(existing.getStatus())) {
                throw new RuntimeException("User is already a member of this team.");
            }

            if (existing != null && "REMOVED".equals(existing.getStatus())) {
                existing.setStatus("ACTIVE");
                existing.setJoinedAt(LocalDateTime.now());
                existing.setUpdatedAt(LocalDateTime.now());
                teamMemberRepository.save(existing);

                log.info("User {} re-added to team {}", request.getUserId(), request.getTeamId());

                User user = userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found."));

                return buildTeamMemberResponse(existing, user);
            }
        }

        TeamMember teamMember = TeamMember.builder()
                .teamId(request.getTeamId())
                .projectId(team.getProjectId())
                .orgId(team.getOrgId())
                .userId(request.getUserId())
                .status("ACTIVE")
                .joinedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teamMemberRepository.save(teamMember);
        log.info("User {} added to team {} in project {}", request.getUserId(), request.getTeamId(), team.getProjectId());

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        return buildTeamMemberResponse(teamMember, user);
    }

    // ── Build team member response ───────────────────────────────
    private TeamMemberResponse buildTeamMemberResponse(TeamMember teamMember, User user) {
        return TeamMemberResponse.builder()
                .id(teamMember.getId())
                .teamId(teamMember.getTeamId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .status(teamMember.getStatus())
                .joinedAt(teamMember.getJoinedAt())
                .build();
    }

    // ── Get all teams in project ─────────────────────────────────
    public List<TeamResponse> getProjectTeams(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found."));

        OrganisationMember requester = memberRepository.findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        // FIXED: Using safe "PRIVATE".equals() to handle possible null visibility
        if ("PRIVATE".equals(project.getVisibility())) {
            boolean isAdmin = "ADMIN".equals(requester.getRole());
            boolean isLeader = project.getProjectLeaderId() != null && project.getProjectLeaderId().equals(userId);
            boolean isTeamMember = teamMemberRepository.findByProjectIdAndUserId(projectId, userId)
                    .stream()
                    .anyMatch(tm -> "ACTIVE".equals(tm.getStatus()));

            if (!isAdmin && !isLeader && !isTeamMember) {
                throw new RuntimeException("You do not have access to this project.");
            }
        }

        return teamRepository.findByProjectIdAndStatus(projectId, "ACTIVE")
                .stream()
                .map(team -> buildTeamResponse(team, project.getName()))
                .toList();
    }

    // ── Get single team ──────────────────────────────────────────
    public TeamResponse getTeam(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found."));

        Project project = projectRepository.findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found."));

        OrganisationMember requester = memberRepository.findByOrgIdAndUserId(team.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        // FIXED: Safe check & cleaned up double bracket syntax error
        if (project.getVisibility() == null || "PRIVATE".equals(project.getVisibility())) {
            boolean isAdmin = "ADMIN".equals(requester.getRole());
            boolean isLeader = project.getProjectLeaderId() != null && project.getProjectLeaderId().equals(userId);
            boolean isTeamMember = teamMemberRepository.findByProjectIdAndUserId(team.getProjectId(), userId)
                    .stream()
                    .anyMatch(tm -> "ACTIVE".equals(tm.getStatus()));

            if (!isAdmin && !isLeader && !isTeamMember) {
                throw new RuntimeException("You do not have access to this project.");
            }
        }

        return buildTeamResponse(team, project.getName());
    }

    // ── Get all members of a team ────────────────────────────────
    public List<TeamMemberResponse> getTeamMembers(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found."));

        Project project = projectRepository.findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found."));

        OrganisationMember requester = memberRepository.findByOrgIdAndUserId(team.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        // FIXED: Using safe "PRIVATE".equals() to handle possible null visibility
        if ("PRIVATE".equals(project.getVisibility())) {
            boolean isAdmin = "ADMIN".equals(requester.getRole());
            boolean isLeader = project.getProjectLeaderId() != null && project.getProjectLeaderId().equals(userId);
            boolean isTeamMember = teamMemberRepository.findByProjectIdAndUserId(team.getProjectId(), userId)
                    .stream()
                    .anyMatch(tm -> "ACTIVE".equals(tm.getStatus()));

            if (!isAdmin && !isLeader && !isTeamMember) {
                throw new RuntimeException("You do not have access to this project.");
            }
        }

        return teamMemberRepository.findByTeamIdAndStatus(teamId, "ACTIVE")
                .stream()
                .map(tm -> {
                    User user = userRepository.findById(tm.getUserId()).orElse(null);
                    if (user == null) return null;
                    return buildTeamMemberResponse(tm, user);
                })
                .filter(Objects::nonNull)
                .toList();
    }

    // ── Get my teams in project ──────────────────────────────────
    public List<TeamResponse> getMyTeams(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found."));

        memberRepository.findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this organisation."));

        List<String> myTeamIds = teamMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .stream()
                .filter(tm -> "ACTIVE".equals(tm.getStatus()))
                .map(TeamMember::getTeamId)
                .toList();

        return myTeamIds.stream()
                .map(teamId -> teamRepository.findById(teamId).orElse(null))
                .filter(Objects::nonNull)
                .map(team -> buildTeamResponse(team, project.getName()))
                .toList();
    }

    // ── Remove member from team ──────────────────────────────────
    public void removeTeamMember(
            String requesterId,
            String teamId,
            String userId) {

        // 1. find team
        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        // 2. find project
        Project project = projectRepository
                .findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(team.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can remove
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can remove team members."
            );
        }

        // 5. project leader can only remove from their own project
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(requesterId)) {
            throw new RuntimeException(
                    "You can only remove members from your own project teams."
            );
        }

        // 6. find team member record
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "User is not a member of this team."
                ));

        // 7. check already removed
        if (teamMember.getStatus().equals("REMOVED")) {
            throw new RuntimeException(
                    "User is already removed from this team."
            );
        }

        // 8. cannot remove yourself
        if (userId.equals(requesterId)) {
            throw new RuntimeException(
                    "You cannot remove yourself from the team."
            );
        }

        //  unassign active tasks in this team
        taskService.unassignTeamMemberTasks(teamId, userId);

        // 9. soft delete — mark as REMOVED
        teamMember.setStatus("REMOVED");
        teamMember.setUpdatedAt(LocalDateTime.now());
        teamMemberRepository.save(teamMember);

        log.info("User {} removed from team {} by {}",
                userId, teamId, requesterId);
    }

    // ── Leave team (member leaves themselves) ────────────────────
    public void leaveTeam(String userId, String teamId) {

        // 1. find team
        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        // 2. find team member record
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this team."
                ));

        // 3. check already removed
        if (teamMember.getStatus().equals("REMOVED")) {
            throw new RuntimeException(
                    "You are already removed from this team."
            );
        }

        // unassign active tasks in this team
        taskService.unassignTeamMemberTasks(teamId, userId);

        // 4. mark as REMOVED
        teamMember.setStatus("REMOVED");
        teamMember.setUpdatedAt(LocalDateTime.now());
        teamMemberRepository.save(teamMember);

        log.info("User {} left team {}", userId, teamId);
    }


    // ── Update Team ──────────────────────────────────────────────
    public TeamResponse updateTeam(
            String requesterId,
            String teamId,
            UpdateTeamRequest request) {

        // 1. find team
        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        // 2. find project
        Project project = projectRepository
                .findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(team.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN or PROJECT_LEADER can update
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can update teams."
            );
        }

        // 5. project leader can only update their own project teams
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(requesterId)) {
            throw new RuntimeException(
                    "You can only update teams in your own project."
            );
        }

        // 6. update name if provided
        if (request.getName() != null &&
                !request.getName().isBlank()) {

            // check new name not taken in same project
            if (!request.getName().equals(team.getName()) &&
                    teamRepository.existsByProjectIdAndName(
                            team.getProjectId(), request.getName())) {
                throw new RuntimeException(
                        "Team name already exists in this project."
                );
            }
            team.setName(request.getName());
        }

        // 7. update description if provided
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }

        // 8. update status if provided
        if (request.getStatus() != null) {
            if (!request.getStatus().equals("ACTIVE") &&
                    !request.getStatus().equals("INACTIVE")) {
                throw new RuntimeException(
                        "Invalid status. Must be ACTIVE or INACTIVE."
                );
            }
            team.setStatus(request.getStatus());
        }

        // 9. save
        team.setUpdatedAt(LocalDateTime.now());
        teamRepository.save(team);

        log.info("Team {} updated by {}", teamId, requesterId);

        return buildTeamResponse(team, project.getName());
    }

    // ── Delete Team ──────────────────────────────────────────────
    public void deleteTeam(String requesterId, String teamId) {

        // 1. find team
        Team team = teamRepository
                .findById(teamId)
                .orElseThrow(() -> new RuntimeException(
                        "Team not found."
                ));

        // 2. find project
        Project project = projectRepository
                .findById(team.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 3. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(team.getOrgId(), requesterId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 4. only ADMIN can delete team
        if (!requester.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can delete teams."
            );
        }

        // 5. cannot delete ACTIVE team directly
        if (team.getStatus().equals("ACTIVE")) {
            throw new RuntimeException(
                    "Cannot delete an active team. " +
                            "Please mark it as INACTIVE first."
            );
        }

        // 6. delete all team tasks first
        taskService.deleteTeamTasks(teamId);

        // 7. delete all team members first
        List<TeamMember> teamMembers = teamMemberRepository
                .findByTeamIdAndStatus(teamId, "ACTIVE");

        teamMemberRepository.deleteAll(teamMembers);

        // 8. delete team
        teamRepository.delete(team);

        log.info("Team {} deleted by {}", teamId, requesterId);
    }
}