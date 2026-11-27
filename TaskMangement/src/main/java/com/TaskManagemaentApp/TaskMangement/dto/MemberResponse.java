package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {

    private String memberId;        // OrganisationMember id
    private String userId;
    private String name;
    private String email;
    private String avatarUrl;
    private String role;            // ADMIN / MEMBER / PROJECT_LEADER
    private String status;          // ACTIVE / LEFT
    private List<String> userRoles; // roles from User entity
    private LocalDateTime joinedAt;
}