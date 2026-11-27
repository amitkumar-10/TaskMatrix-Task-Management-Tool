package com.TaskManagemaentApp.TaskMangement.controller;

import com.TaskManagemaentApp.TaskMangement.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reminder")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    // POST /reminder/trigger (for testing — remove in production)
    @PostMapping("/trigger")
    public ResponseEntity<?> triggerReminders() {
        reminderService.sendDailyReminders();
        return ResponseEntity.ok(Map.of(
                "message", "Reminder job triggered manually."
        ));
    }
}