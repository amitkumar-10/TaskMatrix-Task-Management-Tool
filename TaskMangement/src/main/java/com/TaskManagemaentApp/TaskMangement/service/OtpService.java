package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.entity.EmailVerifyOtp;
import com.TaskManagemaentApp.TaskMangement.entity.PasswordResetOtp;
import com.TaskManagemaentApp.TaskMangement.repository.EmailVerifyOtpRepository;
import com.TaskManagemaentApp.TaskMangement.repository.PasswordResetOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final EmailVerifyOtpRepository emailVerifyOtpRepository;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    //  send OTP
    public void sendEmailVerifyOtp(String userId, String email, String name) {

        emailVerifyOtpRepository.deleteAllByEmail(email);

        String code = generateCode();

        EmailVerifyOtp otp = EmailVerifyOtp.builder()
                .userId(userId)
                .email(email)
                .otp(code)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();

        emailVerifyOtpRepository.save(otp);
        emailService.sendEmailVerificationOtp(email, name, code);
        log.info("Email verify OTP sent to {}", email);
    }

    // verify OTP
    public void verifyEmailOtp(String email, String userInputOtp) {

        EmailVerifyOtp otpEntity = emailVerifyOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException(
                        "No active OTP found. Please request a new one."
                ));

        if (otpEntity.isExpired()) {
            emailVerifyOtpRepository.deleteAllByEmail(email);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!otpEntity.getOtp().equals(userInputOtp)) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }

        otpEntity.setUsed(true);
        emailVerifyOtpRepository.save(otpEntity);
        emailVerifyOtpRepository.deleteAllByEmail(email);

        log.info("OTP verified for {}", email);
    }

    // resend email verify OTP
    public void resendEmailVerifyOtp(String userId, String email, String name) {

        // delete old OTPs first
        emailVerifyOtpRepository.deleteAllByEmail(email);

        // generate new code
        String code = generateCode();

        EmailVerifyOtp otp = EmailVerifyOtp.builder()
                .userId(userId)
                .email(email)
                .otp(code)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();

        // save to DB
        emailVerifyOtpRepository.save(otp);

        // send email
        emailService.sendEmailVerificationOtp(email, name, code);

        log.info("OTP resent to {}", email);
    }

    // send password reset OTP
    public void sendPasswordResetOtp(String userId, String email, String name) {

        // delete old OTPs first
        passwordResetOtpRepository.deleteAllByEmail(email);

        String code = generateCode();

        PasswordResetOtp otp = PasswordResetOtp.builder()
                .userId(userId)
                .email(email)
                .otp(code)
                .used(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();

        // save to DB
        passwordResetOtpRepository.save(otp);

        // send email
        emailService.sendEmailVerificationOtp(email, name, code);

        log.info("Password reset OTP sent to {}", email);
    }

    // ── verify password reset OTP → return resetToken ────────────
    public String verifyPasswordResetOtp(String email, String userInputOtp) {

        PasswordResetOtp otpEntity = passwordResetOtpRepository
                .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException(
                        "No active OTP found. Please request a new one."
                ));

        if (otpEntity.isExpired()) {
            passwordResetOtpRepository.deleteAllByEmail(email);
            throw new RuntimeException("OTP expired. Please request a new one.");
        }

        if (!otpEntity.getOtp().equals(userInputOtp)) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }

        // OTP is valid → generate resetToken
        String resetToken = UUID.randomUUID().toString();

        // mark OTP as used + store resetToken
        otpEntity.setUsed(true);
        otpEntity.setResetToken(resetToken);
        otpEntity.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(10));
        passwordResetOtpRepository.save(otpEntity);

        log.info("Password reset OTP verified for {}", email);

        return resetToken;
    }
}