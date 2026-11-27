package com.TaskManagemaentApp.TaskMangement.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attachments")
public class Attachment {

    @Id
    private String id;

    private String orgId;
    private String referenceId;     // taskId or projectId
    private String referenceType;   // TASK / PROJECT

    private String fileName;
    private String fileUrl;         // Cloudinary URL
    private String fileType;        // image / pdf / doc etc
    private String publicId;        // Cloudinary public_id (for deletion)

    private String uploadedBy;      // userId
    private String uploadedByName;

    private LocalDateTime createdAt;
}