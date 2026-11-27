package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.dto.*;
import com.TaskManagemaentApp.TaskMangement.entity.PasswordResetOtp;
import com.TaskManagemaentApp.TaskMangement.entity.User;
import com.TaskManagemaentApp.TaskMangement.repository.PasswordResetOtpRepository;
import com.TaskManagemaentApp.TaskMangement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetOtpRepository passwordResetOtpRepository;

    public void register(RegisterRequest request) {

        // 1. check email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        // 2. save user as unverified
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .roles(List.of("USER"))
                .authProvider("LOCAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        log.info(" User saved with ID: {}", saved.getId());

        // 3. send OTP
        otpService.sendEmailVerifyOtp(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }

    public AuthResponse verifyEmail(EmailVerifyRequest request) {

        // 1. validate OTP — throws if expired or wrong
        otpService.verifyEmailOtp(request.getEmail(), request.getOtp());

        // 2. find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 3. mark email as verified
        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 4. generate JWT
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRoles()
        );

        // 5. return response
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .emailVerified(true)
                .build();
    }

    // resend OTP
    public void resendOtp(ResendOtpRequest request) {

        // 1. check user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 2. check if already verified — no point resending
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified. Please login.");
        }

        // 3. resend OTP
        otpService.resendEmailVerifyOtp(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }

    // Login
    public AuthResponse login(LoginRequest request) {

        // 1. find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        // 2. check password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        // 3. if email not verified → resend OTP automatically
        if (!user.isEmailVerified()) {
            otpService.resendEmailVerifyOtp(
                    user.getId(),
                    user.getEmail(),
                    user.getName()
            );
            throw new RuntimeException(
                    "Email not verified. A new OTP has been sent to " + user.getEmail()
            );
        }

        // 4. generate JWT and return
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRoles()
        );

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .emailVerified(true)
                .build();
    }

    // Forgot password → send OTP
    public void forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No account found with this email."
                ));

        otpService.sendPasswordResetOtp(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }

    //  Verify reset OTP → return resetToken
    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {

        String resetToken = otpService.verifyPasswordResetOtp(
                request.getEmail(),
                request.getOtp()
        );

        return VerifyResetOtpResponse.builder()
                .resetToken(resetToken)
                .message("OTP verified. Use resetToken to set new password.")
                .build();
    }

    // Reset password → verify resetToken + save new password
    public void resetPassword(ResetPasswordRequest request) {

        // 1. find OTP record by resetToken
        PasswordResetOtp otpEntity = passwordResetOtpRepository
                .findByResetToken(request.getResetToken())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid or expired reset token."
                ));

        // 2. check resetToken not expired
        if (otpEntity.isResetTokenExpired()) {
            passwordResetOtpRepository.delete(otpEntity);
            throw new RuntimeException(
                    "Reset token expired. Please start over."
            );
        }

        // 3. find user
        User user = userRepository.findByEmail(otpEntity.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 4. save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 5. cleanup
        passwordResetOtpRepository.delete(otpEntity);

        log.info("Password reset successful for {}", otpEntity.getEmail());
    }


}
