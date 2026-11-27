package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.CreateProjectRequest;
import com.TaskManagemaentApp.TaskMangement.dto.ProjectResponse;
import com.TaskManagemaentApp.TaskMangement.dto.UpdateProjectRequest;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganisationRepository organisationRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskService taskService;

    // ── Create Project ───────────────────────────────────────────
    public ProjectResponse createProject(
            String userId, CreateProjectRequest request) {

        // 1. check org exists
        organisationRepository.findById(request.getOrgId())
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is ADMIN or PROJECT_LEADER
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(request.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can create projects."
            );
        }

        // 3. check project name unique in org
        if (projectRepository.existsByOrgIdAndName(
                request.getOrgId(), request.getName())) {
            throw new RuntimeException(
                    "Project name already exists in this organisation."
            );
        }

        // 4. validate project leader if provided
        String projectLeaderId = null;
        if (request.getProjectLeaderId() != null) {

            OrganisationMember leader = memberRepository
                    .findById(request.getProjectLeaderId())
                    .orElseThrow(() -> new RuntimeException(
                            "Project leader member not found."
                    ));

            if (!leader.getOrgId().equals(request.getOrgId())) {
                throw new RuntimeException(
                        "Project leader must be a member of this organisation."
                );
            }

            if (!leader.getRole().equals("PROJECT_LEADER") &&
                    !leader.getRole().equals("ADMIN")) {
                throw new RuntimeException(
                        "Selected member is not a Project Leader. " +
                                "Please promote them first."
                );
            }

            projectLeaderId = leader.getUserId();
        }

        // 5. create project
        Project project = Project.builder()
                .orgId(request.getOrgId())
                .name(request.getName())
                .description(request.getDescription())
                .status("ACTIVE")
                .visibility(request.getVisibility() != null
                        ? request.getVisibility() : "PRIVATE")  // default PRIVATE
                .createdBy(userId)
                .projectLeaderId(projectLeaderId)
                .startDate(request.getStartDate() != null
                        ? request.getStartDate() : LocalDateTime.now())
                .endDate(request.getEndDate())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        projectRepository.save(project);

        log.info("Project {} created in org {} by {}",
                project.getName(), request.getOrgId(), userId);

        return buildProjectResponse(project);
    }

    // ── Build response helper ────────────────────────────────────
    private ProjectResponse buildProjectResponse(Project project) {

        // get creator name
        String createdByName = userRepository
                .findById(project.getCreatedBy())
                .map(User::getName)
                .orElse("Unknown");

        // get leader name
        String leaderName = null;
        if (project.getProjectLeaderId() != null) {
            leaderName = userRepository
                    .findById(project.getProjectLeaderId())
                    .map(User::getName)
                    .orElse("Unknown");
        }

        return ProjectResponse.builder()
                .id(project.getId())
                .orgId(project.getOrgId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .createdBy(project.getCreatedBy())
                .createdByName(createdByName)
                .projectLeaderId(project.getProjectLeaderId())
                .projectLeaderName(leaderName)
                .totalTeams(0)    // updated in module 3
                .totalTasks(0)    // updated in module 4
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .build();
    }

    // ── Get all projects in org ──────────────────────────────────
    public List<ProjectResponse> getOrgProjects(
            String orgId, String userId) {

        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        List<Project> projects = projectRepository
                .findByOrgId(orgId);

        return projects.stream()
                .filter(project -> {

                    // ADMIN sees all projects
                    if (requester.getRole().equals("ADMIN")) {
                        return true;
                    }

                    // PUBLIC projects visible to all
                    if (project.getVisibility().equals("PUBLIC")) {
                        return true;
                    }

                    // PRIVATE → check if leader or team member
                    boolean isLeader = project.getProjectLeaderId() != null
                            && project.getProjectLeaderId().equals(userId);

                    boolean isTeamMember = teamMemberRepository
                            .findByProjectIdAndUserId(project.getId(), userId)
                            .stream()
                            .anyMatch(tm -> tm.getStatus().equals("ACTIVE"));

                    return isLeader || isTeamMember;
                })
                .map(this::buildProjectResponse)
                .toList();
    }

    // ── Get single project ───────────────────────────────────────
    public ProjectResponse getProject(
            String projectId, String userId) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. check visibility
        if (project.getVisibility().equals("PRIVATE")) {

            boolean isAdmin = requester.getRole().equals("ADMIN");

            boolean isProjectLeader = project.getProjectLeaderId() != null
                    && project.getProjectLeaderId().equals(userId);

            boolean isTeamMember = teamMemberRepository
                    .findByProjectIdAndUserId(projectId, userId)
                    .stream()
                    .anyMatch(tm -> tm.getStatus().equals("ACTIVE"));

            if (!isAdmin && !isProjectLeader && !isTeamMember) {
                throw new RuntimeException(
                        "You do not have access to this project."
                );
            }
        }

        return buildProjectResponse(project);
    }


    // ── Get projects by status ───────────────────────────────────
    public List<ProjectResponse> getProjectsByStatus(
            String orgId, String status, String userId) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is member
        memberRepository.findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. validate status
        if (!status.equals("ACTIVE") &&
                !status.equals("COMPLETED") &&
                !status.equals("ON_HOLD") &&
                !status.equals("CANCELLED")) {
            throw new RuntimeException(
                    "Invalid status. Must be ACTIVE, COMPLETED, ON_HOLD or CANCELLED."
            );
        }

        // 4. get projects by status
        return projectRepository
                .findByOrgIdAndStatus(orgId, status)
                .stream()
                .map(this::buildProjectResponse)
                .toList();
    }



    // ── Get my projects (as leader) ──────────────────────────────
    public List<ProjectResponse> getMyProjects(
            String orgId, String userId) {

        // 1. check org exists
        organisationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException(
                        "Organisation not found."
                ));

        // 2. check requester is member
        memberRepository.findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. get projects where user is leader
        return projectRepository
                .findByOrgIdAndProjectLeaderId(orgId, userId)
                .stream()
                .map(this::buildProjectResponse)
                .toList();
    }

    // ── Update Project ───────────────────────────────────────────
    public ProjectResponse updateProject(
            String projectId,
            String userId,
            UpdateProjectRequest request) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. only ADMIN or PROJECT_LEADER can update
        if (!requester.getRole().equals("ADMIN") &&
                !requester.getRole().equals("PROJECT_LEADER")) {
            throw new RuntimeException(
                    "Only admins or project leaders can update projects."
            );
        }

        // 4. if PROJECT_LEADER → can only update their own project
        if (requester.getRole().equals("PROJECT_LEADER") &&
                !project.getProjectLeaderId().equals(userId)) {
            throw new RuntimeException(
                    "You can only update projects assigned to you."
            );
        }

        // 5. update name if provided
        if (request.getName() != null &&
                !request.getName().isBlank()) {

            // check new name not taken by another project
            if (!request.getName().equals(project.getName()) &&
                    projectRepository.existsByOrgIdAndName(
                            project.getOrgId(), request.getName())) {
                throw new RuntimeException(
                        "Project name already exists in this organisation."
                );
            }
            project.setName(request.getName());
        }

        // 6. update description if provided
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        // 7. update status if provided
        if (request.getStatus() != null) {
            if (!request.getStatus().equals("ACTIVE") &&
                    !request.getStatus().equals("COMPLETED") &&
                    !request.getStatus().equals("ON_HOLD") &&
                    !request.getStatus().equals("CANCELLED")) {
                throw new RuntimeException(
                        "Invalid status. Must be ACTIVE, COMPLETED, ON_HOLD or CANCELLED."
                );
            }
            project.setStatus(request.getStatus());
        }

        // 8. update project leader if provided
        if (request.getProjectLeaderId() != null) {

            OrganisationMember newLeader = memberRepository
                    .findById(request.getProjectLeaderId())
                    .orElseThrow(() -> new RuntimeException(
                            "Member not found."
                    ));

            if (!newLeader.getOrgId().equals(project.getOrgId())) {
                throw new RuntimeException(
                        "Member does not belong to this organisation."
                );
            }

            if (!newLeader.getRole().equals("PROJECT_LEADER") &&
                    !newLeader.getRole().equals("ADMIN")) {
                throw new RuntimeException(
                        "Selected member is not a Project Leader. " +
                                "Please promote them first."
                );
            }

            project.setProjectLeaderId(newLeader.getUserId());
        }

        // 9. update dates if provided
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }

        // 10. save
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);

        log.info("Project {} updated by {}", projectId, userId);

        return buildProjectResponse(project);
    }

    // ── Delete Project ────────────────────────────────
    public void deleteProject(String projectId, String userId) {

        // 1. find project
        Project project = projectRepository
                .findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        // 2. check requester is member of org
        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // 3. only ADMIN can delete
        if (!requester.getRole().equals("ADMIN")) {
            throw new RuntimeException(
                    "Only admins can delete projects."
            );
        }

        // 4. cannot delete ACTIVE project directly
        // must mark as CANCELLED first
        if (project.getStatus().equals("ACTIVE")) {
            throw new RuntimeException(
                    "Cannot delete an active project. " +
                            "Please mark it as CANCELLED first."
            );
        }

        // 5. delete all tasks in project first
        taskService.deleteProjectTasks(projectId);

        // 6. delete project
        projectRepository.delete(project);

        log.info("Project {} deleted by {}", projectId, userId);
    }

}