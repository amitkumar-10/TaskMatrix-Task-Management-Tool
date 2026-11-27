package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgResponse {

    private String id;
    private String name;
    private String description;
    private String userRole;
    private String adminId;
    private String avatarUrl;
    private String status;
    private int totalMembers;
    private LocalDateTime createdAt;
}