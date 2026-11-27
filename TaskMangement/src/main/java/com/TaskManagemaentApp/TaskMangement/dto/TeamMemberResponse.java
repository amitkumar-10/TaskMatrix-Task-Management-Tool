package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {

    private String id;          // TeamMember id
    private String teamId;
    private String userId;
    private String name;
    private String email;
    private String avatarUrl;
    private String status;
    private LocalDateTime joinedAt;
}