package com.TaskManagemaentApp.TaskMangement.service;

import com.TaskManagemaentApp.TaskMangement.entity.*;
import com.TaskManagemaentApp.TaskMangement.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ── Runs every day at 9:00 AM ───────────────────────────────
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDailyReminders() {

        log.info("Running tiered deadline reminder job...");

        sendTaskReminders();
        sendProjectReminders();

        log.info("Reminder job completed.");
    }

    // ── Task reminders — tiered milestones ──────────────────────
    private void sendTaskReminders() {

        LocalDateTime now = LocalDateTime.now();

        List<Task> activeTasks = taskRepository.findAll()
                .stream()
                .filter(t -> t.getDueDate() != null)
                .filter(t -> !t.getStatus().equals("DONE"))
                .filter(t -> t.getAssignedTo() != null)
                .toList();

        for (Task task : activeTasks) {

            long hoursLeft = Duration.between(
                    now, task.getDueDate()
            ).toHours();

            User user = userRepository
                    .findById(task.getAssignedTo())
                    .orElse(null);
            if (user == null) continue;

            Project project = projectRepository
                    .findById(task.getProjectId())
                    .orElse(null);
            String projectName = project != null
                    ? project.getName() : "Unknown";

            // ── 3 days left (between 60-72 hours) ──
            if (hoursLeft <= 72 && hoursLeft > 24
                    && !task.isReminder3DaySent()) {

                sendTaskReminder(task, user, projectName,
                        "3 days left", "Heads up — task due in 3 days");
                task.setReminder3DaySent(true);
                taskRepository.save(task);
            }

            // ── 1 day left (between 24-48 hours) ──
            else if (hoursLeft <= 24 && hoursLeft > 0
                    && !task.isReminder1DaySent()) {

                sendTaskReminder(task, user, projectName,
                        "1 day left", "Due tomorrow!");
                task.setReminder1DaySent(true);
                taskRepository.save(task);
            }

            // ── due today (0 hours or less, not yet overdue) ──
            else if (hoursLeft <= 0 && hoursLeft > -24
                    && !task.isReminderDueTodaySent()) {

                sendTaskReminder(task, user, projectName,
                        "Due today", "Task is due today!");
                task.setReminderDueTodaySent(true);
                taskRepository.save(task);
            }

            // ── overdue (past due date, not yet sent) ──
            else if (hoursLeft <= -24
                    && !task.isReminderOverdueSent()) {

                sendTaskReminder(task, user, projectName,
                        "Overdue", "Task is now overdue!");
                task.setReminderOverdueSent(true);
                taskRepository.save(task);
            }
        }
    }

    private void sendTaskReminder(
            Task task, User user, String projectName,
            String label, String notifTitle) {

        emailService.sendTaskDueReminder(
                user.getEmail(),
                user.getName(),
                task.getTitle(),
                task.getDueDate().format(FORMATTER),
                projectName
        );

        notificationService.sendNotification(
                user.getId(),
                notifTitle,
                task.getTitle() + " — " + label,
                "TASK_DUE_SOON",
                task.getId(),
                "TASK"
        );

        log.info("[{}] reminder sent for task {} to {}",
                label, task.getId(), user.getEmail());
    }

    // ── Project reminders — tiered milestones ────────────────────
    private void sendProjectReminders() {

        LocalDateTime now = LocalDateTime.now();

        List<Project> activeProjects = projectRepository.findAll()
                .stream()
                .filter(p -> p.getEndDate() != null)
                .filter(p -> p.getStatus().equals("ACTIVE"))
                .filter(p -> p.getProjectLeaderId() != null)
                .toList();

        for (Project project : activeProjects) {

            long hoursLeft = Duration.between(
                    now, project.getEndDate()
            ).toHours();

            User leader = userRepository
                    .findById(project.getProjectLeaderId())
                    .orElse(null);
            if (leader == null) continue;

            if (hoursLeft <= 72 && hoursLeft > 24
                    && !project.isReminder3DaySent()) {

                sendProjectReminder(project, leader,
                        "3 days left", "Heads up — project due in 3 days");
                project.setReminder3DaySent(true);
                projectRepository.save(project);
            }
            else if (hoursLeft <= 24 && hoursLeft > 0
                    && !project.isReminder1DaySent()) {

                sendProjectReminder(project, leader,
                        "1 day left", "Project due tomorrow!");
                project.setReminder1DaySent(true);
                projectRepository.save(project);
            }
            else if (hoursLeft <= 0
                    && !project.isReminderDueTodaySent()) {

                sendProjectReminder(project, leader,
                        "Due today", "Project deadline is today!");
                project.setReminderDueTodaySent(true);
                projectRepository.save(project);
            }
        }
    }

    private void sendProjectReminder(
            Project project, User leader,
            String label, String notifTitle) {

        emailService.sendProjectDeadlineReminder(
                leader.getEmail(),
                leader.getName(),
                project.getName(),
                project.getEndDate().format(FORMATTER)
        );

        notificationService.sendNotification(
                leader.getId(),
                notifTitle,
                project.getName() + " — " + label,
                "PROJECT_DUE_SOON",
                project.getId(),
                "PROJECT"
        );

        log.info("[{}] reminder sent for project {} to {}",
                label, project.getId(), leader.getEmail());
    }
}