package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    private String name;

    @NonNull
    @Indexed (unique = true)
    private String email;

    private String password;

    private boolean emailVerified;

    private List<String> roles;

    private String avatarUrl;

    private String authProvider;      // "LOCAL", "GOOGLE", "GITHUB"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
