package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentResponse {

    private String id;
    private String referenceId;
    private String referenceType;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private String uploadedByName;
    private LocalDateTime createdAt;
}