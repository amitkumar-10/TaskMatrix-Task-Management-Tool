package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.EmailVerifyOtp;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EmailVerifyOtpRepository extends MongoRepository<EmailVerifyOtp, String> {
    Optional<EmailVerifyOtp> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    void deleteAllByEmail(String email);
}
