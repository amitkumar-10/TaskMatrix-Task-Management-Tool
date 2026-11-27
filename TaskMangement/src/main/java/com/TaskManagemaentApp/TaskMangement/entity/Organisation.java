package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "organisations")
public class Organisation {

    @Id
    private String id;

    private String name;
    private String description;
    private String adminId;         // user who created org

    private String avatarUrl;
    private String status;          // ACTIVE / INACTIVE

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}