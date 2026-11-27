package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.Data;

@Data
public class UpdateTeamRequest {

    private String name;
    private String description;
    private String status;          // ACTIVE / INACTIVE
}