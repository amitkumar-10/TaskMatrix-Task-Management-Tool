package com.TaskManagemaentApp.TaskMangement.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {

    private String query;
    private List<ProjectResponse> projects;
    private List<TaskResponse> tasks;
    private List<MemberResponse> members;
    private int totalResults;
}