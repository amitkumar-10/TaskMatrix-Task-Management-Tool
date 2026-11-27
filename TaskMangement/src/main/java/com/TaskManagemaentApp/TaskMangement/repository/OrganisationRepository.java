package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.Organisation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface OrganisationRepository
        extends MongoRepository<Organisation, String> {

    Optional<Organisation> findByName(String name);

    boolean existsByName(String name);

    List<Organisation> findByAdminId(String adminId);
}