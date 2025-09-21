package com.example.projectbackend;

import com.example.projectbackend.model.User;
import com.example.projectbackend.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
public class ProjectbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectbackendApplication.class, args);
	}

	@Bean
	@Transactional
	CommandLineRunner initDatabase(UserService userService, EntityManager entityManager) {
		return args -> {
			// Clear existing data and reset sequence
			System.out.println("Clearing existing users and resetting sequence...");
			try {
				entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
				entityManager.createNativeQuery("ALTER TABLE users ALTER COLUMN id RESTART WITH 1").executeUpdate();
				System.out.println("Database reset complete.");
			} catch (Exception e) {
				System.out.println("Note: Database reset failed (normal for first run): " + e.getMessage());
			}
			
			// Create test users
			// Always create fresh users after reset
			User patient1 = new User("patient1@test.com", "password", "Ramesh Kumar", User.Role.PATIENT);
			patient1.setPhone("+91-9876543210");
			patient1.setAddress("123 Main St, Delhi");
			userService.save(patient1);
			System.out.println("Created patient: Ramesh Kumar with ID: " + patient1.getId());

			User patient2 = new User("patient2@test.com", "password", "Sunita Devi", User.Role.PATIENT);
			patient2.setPhone("+91-9876543211");
			patient2.setAddress("456 Park Ave, Mumbai");
			userService.save(patient2);
			System.out.println("Created patient: Sunita Devi with ID: " + patient2.getId());

			User patient3 = new User("patient3@test.com", "password", "Kiran Patel", User.Role.PATIENT);
			patient3.setPhone("+91-9876543212");
			patient3.setAddress("789 Oak St, Bangalore");
			userService.save(patient3);
			System.out.println("Created patient: Kiran Patel with ID: " + patient3.getId());

			User doctor1 = new User("doctor1@test.com", "password", "Dr. Rachit Sharma", User.Role.DOCTOR);
			doctor1.setPhone("+91-9876543213");
			doctor1.setSpecialization("General Medicine");
			doctor1.setExperience("5+ years");
			doctor1.setLicenseNumber("MED12345");
			userService.save(doctor1);
			System.out.println("Created doctor: Dr. Rachit Sharma with ID: " + doctor1.getId());

			// Print all users for debugging
			System.out.println("\n=== All Users in Database ===");
			userService.getAllUsers().forEach(user -> 
				System.out.println("ID: " + user.getId() + ", Name: " + user.getName() + ", Role: " + user.getRole())
			);
			System.out.println("==============================\n");
		};
	}
}
