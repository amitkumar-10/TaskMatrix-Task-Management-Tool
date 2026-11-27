package com.TaskManagemaentApp.TaskMangement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.TaskManagemaentApp.TaskMangement.dto.AttachmentResponse;
import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final Cloudinary cloudinary;
    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final OrganisationMemberRepository memberRepository;
    private final UserRepository userRepository;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // ── Upload attachment to Task ────────────────────────────────
    public AttachmentResponse uploadTaskAttachment(
            String userId, String taskId, MultipartFile file) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException(
                        "Task not found."
                ));

        // check requester is member of org
        memberRepository.findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        // only assigned member, leader, or admin can attach
        Project project = projectRepository
                .findById(task.getProjectId())
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().equals(userId);
        boolean isLeader = project.getProjectLeaderId() != null
                && project.getProjectLeaderId().equals(userId);

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(task.getOrgId(), userId)
                .orElseThrow();
        boolean isAdmin = requester.getRole().equals("ADMIN");

        if (!isAssigned && !isLeader && !isAdmin) {
            throw new RuntimeException(
                    "You do not have permission to attach files to this task."
            );
        }

        Attachment attachment = uploadFile(
                file, task.getOrgId(), taskId, "TASK", userId
        );

        log.info("Attachment uploaded to task {} by {}",
                taskId, userId);

        return buildResponse(attachment);
    }

    // ── Upload attachment to Project ─────────────────────────────
    public AttachmentResponse uploadProjectAttachment(
            String userId, String projectId, MultipartFile file) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException(
                        "Project not found."
                ));

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(project.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        boolean isLeader = project.getProjectLeaderId() != null
                && project.getProjectLeaderId().equals(userId);
        boolean isAdmin = requester.getRole().equals("ADMIN");

        if (!isLeader && !isAdmin) {
            throw new RuntimeException(
                    "Only admins or the project leader can attach files here."
            );
        }

        Attachment attachment = uploadFile(
                file, project.getOrgId(), projectId, "PROJECT", userId
        );

        log.info("Attachment uploaded to project {} by {}",
                projectId, userId);

        return buildResponse(attachment);
    }

    // ── Core upload logic ────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private Attachment uploadFile(
            MultipartFile file, String orgId,
            String referenceId, String referenceType,
            String userId) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException(
                    "File too large. Maximum size is 10MB."
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new RuntimeException(
                    "Unsupported file type. Allowed: images, PDF, " +
                            "Word, and common design files."
            );
        }

        try {
            Map<String, Object> uploadResult = cloudinary
                    .uploader()
                    .upload(file.getBytes(), ObjectUtils.asMap(
                            "folder", "flowship/" + referenceType.toLowerCase(),
                            "resource_type", "auto"
                    ));

            String fileUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            User uploader = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException(
                            "User not found."
                    ));

            Attachment attachment = Attachment.builder()
                    .orgId(orgId)
                    .referenceId(referenceId)
                    .referenceType(referenceType)
                    .fileName(file.getOriginalFilename())
                    .fileUrl(fileUrl)
                    .fileType(contentType)
                    .publicId(publicId)
                    .uploadedBy(userId)
                    .uploadedByName(uploader.getName())
                    .createdAt(LocalDateTime.now())
                    .build();

            return attachmentRepository.save(attachment);

        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new RuntimeException(
                    "File upload failed. Please try again."
            );
        }
    }

    private boolean isAllowedType(String contentType) {
        return contentType.startsWith("image/")
                || contentType.equals("application/pdf")
                || contentType.equals("application/msword")
                || contentType.equals(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.equals("application/vnd.figma");
    }

    // ── Get attachments for a task/project ────────────────────────
    public List<AttachmentResponse> getAttachments(
            String referenceId, String referenceType, String userId) {

        List<Attachment> attachments = attachmentRepository
                .findByReferenceIdAndReferenceType(
                        referenceId, referenceType);

        if (attachments.isEmpty()) return List.of();

        // access check based on org membership
        String orgId = attachments.get(0).getOrgId();
        memberRepository.findByOrgIdAndUserId(orgId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        return attachments.stream()
                .map(this::buildResponse)
                .toList();
    }

    // ── Delete attachment ────────────────────────────────────────
    public void deleteAttachment(String userId, String attachmentId) {

        Attachment attachment = attachmentRepository
                .findById(attachmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Attachment not found."
                ));

        OrganisationMember requester = memberRepository
                .findByOrgIdAndUserId(
                        attachment.getOrgId(), userId)
                .orElseThrow(() -> new RuntimeException(
                        "You are not a member of this organisation."
                ));

        boolean isUploader = attachment.getUploadedBy()
                .equals(userId);
        boolean isAdmin = requester.getRole().equals("ADMIN");

        if (!isUploader && !isAdmin) {
            throw new RuntimeException(
                    "You can only delete your own attachments."
            );
        }

        try {
            cloudinary.uploader().destroy(
                    attachment.getPublicId(),
                    ObjectUtils.emptyMap()
            );
        } catch (Exception e) {
            log.warn("Failed to delete from Cloudinary: {}",
                    e.getMessage());
            // continue deleting from DB even if Cloudinary fails
        }

        attachmentRepository.delete(attachment);

        log.info("Attachment {} deleted by {}",
                attachmentId, userId);
    }

    // ── Build response ───────────────────────────────────────────
    private AttachmentResponse buildResponse(
            Attachment attachment) {

        return AttachmentResponse.builder()
                .id(attachment.getId())
                .referenceId(attachment.getReferenceId())
                .referenceType(attachment.getReferenceType())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileType(attachment.getFileType())
                .uploadedByName(attachment.getUploadedByName())
                .createdAt(attachment.getCreatedAt())
                .build();
    }
}