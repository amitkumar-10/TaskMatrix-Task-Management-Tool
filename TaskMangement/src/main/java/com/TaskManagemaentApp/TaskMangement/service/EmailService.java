package com.TaskManagemaentApp.TaskMangement.service;

import org.springframework.beans.factory.ObjectProvider;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.sender-email:}")
    private String brevoSenderEmail;

    private final RestClient restClient = RestClient.create();

    private static final String FROM_EMAIL = "amit11jangir@gmail.com";
    private static final String FROM_NAME  = "Team TaskMatrix";

    //  Send Email Verification OTP
    public void sendEmailVerificationOtp(
            String toEmail, String name, String otp) {

        String subject = "TaskMatrix - Email Verification";
        String body = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f5f5f5;
                             font-family:Arial,sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                            <table width="600" cellpadding="0" cellspacing="0"
                                   style="background:#fff;margin:30px auto;
                                          padding:50px 45px;
                                          border:1px solid #eee;">
                                <tr><td>
                                    <p style="font-size:22px;color:#4a154b;">
                                        Hello %s,
                                    </p>
                                    <p style="font-size:18px;color:#4a154b;">
                                        Use the OTP below to verify your email:
                                    </p>
                                    <div style="text-align:center;
                                                background:#eef1ff;
                                                border:1px solid #d6dbff;
                                                border-radius:14px;
                                                padding:35px;margin:40px 60px;">
                                        <span style="font-size:56px;
                                                     font-weight:700;
                                                     letter-spacing:14px;
                                                     color:#4f46e5;">%s</span>
                                    </div>
                                    <p style="font-size:16px;color:#7a7a7a;">
                                        Valid for <strong>10 minutes</strong>.
                                        Do not share it.
                                    </p>
                                </td></tr>
                            </table>
                        </td></tr>
                    </table>
                </body>
                </html>
                """.formatted(name, otp);

        sendHtmlEmail(toEmail, subject, body);
    }

    //  Send Password Reset OTP
    public void sendPasswordResetOtp(
            String toEmail, String name, String otp) {

        String subject = "TaskMatrix - Password Reset";
        String body = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f5f5f5;
                             font-family:Arial,sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                            <table width="600" cellpadding="0" cellspacing="0"
                                   style="background:#fff;margin:30px auto;
                                          padding:50px 45px;
                                          border:1px solid #eee;">
                                <tr><td>
                                    <p style="font-size:22px;color:#4a154b;">
                                        Hello %s,
                                    </p>
                                    <p style="font-size:18px;color:#4a154b;">
                                        Use the OTP below to reset your password:
                                    </p>
                                    <div style="text-align:center;
                                                background:#fff3cd;
                                                border:1px solid #ffe69c;
                                                border-radius:14px;
                                                padding:35px;margin:40px 60px;">
                                        <span style="font-size:56px;
                                                     font-weight:700;
                                                     letter-spacing:14px;
                                                     color:#856404;">%s</span>
                                    </div>
                                    <p style="font-size:16px;color:#7a7a7a;">
                                        Valid for <strong>5 minutes</strong>.
                                        If you didn't request this, ignore it.
                                    </p>
                                </td></tr>
                            </table>
                        </td></tr>
                    </table>
                </body>
                </html>
                """.formatted(name, otp);

        sendHtmlEmail(toEmail, subject, body);
    }

    // Send Invitation Email
    public void sendInvitationEmail(
            String toEmail,
            String orgName,
            String invitedByName,
            String inviteLink) {

        String subject = "You're invited to join " + orgName + " on TaskMatrix";
        String body = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f5f5f5;
                             font-family:Arial,sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                            <table width="600" cellpadding="0" cellspacing="0"
                                   style="background:#fff;margin:30px auto;
                                          padding:50px 45px;
                                          border:1px solid #eee;">
                                <tr><td>
                                    <h2 style="color:#4a154b;">
                                        You've been invited! 🎉
                                    </h2>
                                    <p style="font-size:18px;color:#4a154b;">
                                        <strong>%s</strong> has invited you
                                        to join <strong>%s</strong>
                                        on TaskMatrix.
                                    </p>
                                    <div style="text-align:center;
                                                margin:40px 0;">
                                        <a href="%s" style="
                                            background:#4F46E5;
                                            color:white;
                                            padding:16px 32px;
                                            border-radius:8px;
                                            text-decoration:none;
                                            font-size:18px;
                                            font-weight:bold;">
                                            Accept Invitation
                                        </a>
                                    </div>
                                    <p style="font-size:14px;color:#7a7a7a;">
                                        This invitation expires in
                                        <strong>7 days</strong>.
                                        If you don't have a TaskMatrix account,
                                        you'll be asked to create one first.
                                    </p>
                                </td></tr>
                            </table>
                        </td></tr>
                    </table>
                </body>
                </html>
                """.formatted(invitedByName, orgName, inviteLink);

        sendHtmlEmail(toEmail, subject, body);
    }

    //  Core send method (used by all above)
    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            if (!brevoApiKey.isBlank()) {
                // deployed: send through Brevo's HTTPS API
                restClient.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                        "sender", Map.of("name", FROM_NAME, "email", brevoSenderEmail),
                        "to", List.of(Map.of("email", toEmail)),
                        "subject", subject,
                        "htmlContent", htmlBody))
                    .retrieve()
                    .toBodilessEntity();
            } else {
                // local: Gmail SMTP as before
                JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
                if (mailSender == null) {
                    throw new IllegalStateException(
                        "No email provider configured. Set brevo.api-key or spring.mail.host");
                }
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(new InternetAddress(FROM_EMAIL, FROM_NAME));
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlBody, true);
                mailSender.send(message);
            }
            log.info("Email sent to {}", toEmail);
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
                throw new RuntimeException("Failed to send email. Please try again.");
            }
    }

    // ── Task due reminder ────────────────────────────────────────
    public void sendTaskDueReminder(
            String toEmail, String name, String taskTitle,
            String dueDate, String projectName) {

        String subject = "Reminder: Task due soon — " + taskTitle;
        String body = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f5f5f5;
                         font-family:Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#fff;margin:30px auto;
                                      padding:50px 45px;
                                      border:1px solid #eee;">
                            <tr><td>
                                <h2 style="color:#856404;">
                                    ⏰ Task Due Soon
                                </h2>
                                <p style="font-size:18px;color:#4a154b;">
                                    Hi %s,
                                </p>
                                <p style="font-size:18px;color:#4a154b;">
                                    Your task <strong>%s</strong> in
                                    project <strong>%s</strong> is due on
                                    <strong>%s</strong>.
                                </p>
                                <p style="font-size:16px;color:#7a7a7a;">
                                    Please make sure to complete and
                                    submit it before the deadline.
                                </p>
                            </td></tr>
                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
            """.formatted(name, taskTitle, projectName, dueDate);

        sendHtmlEmail(toEmail, subject, body);
    }

    // ── Project deadline reminder ────────────────────────────────
    public void sendProjectDeadlineReminder(
            String toEmail, String name, String projectName,
            String dueDate) {

        String subject = "Reminder: Project deadline approaching — " + projectName;
        String body = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#f5f5f5;
                         font-family:Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center">
                        <table width="600" cellpadding="0" cellspacing="0"
                               style="background:#fff;margin:30px auto;
                                      padding:50px 45px;
                                      border:1px solid #eee;">
                            <tr><td>
                                <h2 style="color:#856404;">
                                    ⏰ Project Deadline Approaching
                                </h2>
                                <p style="font-size:18px;color:#4a154b;">
                                    Hi %s,
                                </p>
                                <p style="font-size:18px;color:#4a154b;">
                                    Your project <strong>%s</strong> is
                                    due on <strong>%s</strong>.
                                </p>
                                <p style="font-size:16px;color:#7a7a7a;">
                                    Please review pending tasks and
                                    ensure timely completion.
                                </p>
                            </td></tr>
                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
            """.formatted(name, projectName, dueDate);

        sendHtmlEmail(toEmail, subject, body);
    }
}