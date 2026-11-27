package com.TaskManagemaentApp.TaskMangement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaskMangementApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskMangementApplication.class, args);
	}

}
