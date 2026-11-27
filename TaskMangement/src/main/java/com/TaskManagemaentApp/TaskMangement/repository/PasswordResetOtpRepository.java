package com.TaskManagemaentApp.TaskMangement.repository;

import com.TaskManagemaentApp.TaskMangement.entity.PasswordResetOtp;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordResetOtpRepository extends MongoRepository<PasswordResetOtp, String> {

    Optional<PasswordResetOtp> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    Optional<PasswordResetOtp> findByResetToken(String resetToken);  // ← new

    void deleteAllByEmail(String email);
}