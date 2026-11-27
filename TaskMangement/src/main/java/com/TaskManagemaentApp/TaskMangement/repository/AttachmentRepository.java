package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Attachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AttachmentRepository
        extends MongoRepository<Attachment, String> {

    List<Attachment> findByReferenceIdAndReferenceType(
            String referenceId, String referenceType
    );
}