package com.example.projectbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(origins = "*")
public class DemoController {
    
    @GetMapping("/sample-data")
    public ResponseEntity<Map<String, Object>> getSampleData() {
        Map<String, Object> sampleData = Map.of(
            "doctors", List.of(
                Map.of(
                    "id", 1,
                    "name", "Dr. Rajesh Sharma",
                    "email", "dr.sharma@teleasha.com",
                    "specialization", "Cardiology",
                    "phone", "+91-9876543210",
                    "address", "Apollo Hospital, Ahmedabad, Gujarat",
                    "experience", "15 years",
                    "rating", 4.8,
                    "consultationFee", 500,
                    "availableToday", true
                ),
                Map.of(
                    "id", 2,
                    "name", "Dr. Priya Patel",
                    "email", "dr.patel@teleasha.com",
                    "specialization", "Pediatrics",
                    "phone", "+91-9876543211",
                    "address", "Sterling Hospital, Vadodara, Gujarat",
                    "experience", "12 years",
                    "rating", 4.9,
                    "consultationFee", 400,
                    "availableToday", true
                ),
                Map.of(
                    "id", 3,
                    "name", "Dr. Amit Mehta",
                    "email", "dr.mehta@teleasha.com",
                    "specialization", "General Medicine",
                    "phone", "+91-9876543212",
                    "address", "Civil Hospital, Surat, Gujarat",
                    "experience", "10 years",
                    "rating", 4.7,
                    "consultationFee", 300,
                    "availableToday", true
                ),
                Map.of(
                    "id", 4,
                    "name", "Dr. Kavita Joshi",
                    "email", "dr.joshi@teleasha.com",
                    "specialization", "Gynecology",
                    "phone", "+91-9876543213",
                    "address", "Zydus Hospital, Rajkot, Gujarat",
                    "experience", "18 years",
                    "rating", 4.9,
                    "consultationFee", 600,
                    "availableToday", false
                )
            ),
            "patients", List.of(
                Map.of(
                    "id", 1,
                    "name", "Ramesh Kumar",
                    "email", "patient1@teleasha.com",
                    "phone", "+91-9876543220",
                    "address", "Village Kheda, Anand District, Gujarat",
                    "age", 45,
                    "gender", "Male",
                    "bloodGroup", "B+",
                    "emergencyContact", "+91-9876543221"
                ),
                Map.of(
                    "id", 2,
                    "name", "Sunita Devi",
                    "email", "patient2@teleasha.com",
                    "phone", "+91-9876543221",
                    "address", "Village Bharuch, Bharuch District, Gujarat",
                    "age", 38,
                    "gender", "Female",
                    "bloodGroup", "A+",
                    "emergencyContact", "+91-9876543222"
                ),
                Map.of(
                    "id", 3,
                    "name", "Kiran Patel",
                    "email", "patient3@teleasha.com",
                    "phone", "+91-9876543222",
                    "address", "Village Dahod, Dahod District, Gujarat",
                    "age", 52,
                    "gender", "Male",
                    "bloodGroup", "O+",
                    "emergencyContact", "+91-9876543223"
                )
            ),
            "loginCredentials", Map.of(
                "doctors", List.of(
                    Map.of("email", "dr.sharma@teleasha.com", "password", "password123", "role", "doctor"),
                    Map.of("email", "dr.patel@teleasha.com", "password", "password123", "role", "doctor"),
                    Map.of("email", "dr.mehta@teleasha.com", "password", "password123", "role", "doctor"),
                    Map.of("email", "dr.joshi@teleasha.com", "password", "password123", "role", "doctor")
                ),
                "patients", List.of(
                    Map.of("email", "patient1@teleasha.com", "password", "password123", "role", "patient"),
                    Map.of("email", "patient2@teleasha.com", "password", "password123", "role", "patient"),
                    Map.of("email", "patient3@teleasha.com", "password", "password123", "role", "patient")
                )

            )
        );
        
        return ResponseEntity.ok(sampleData);
    }
    
    @GetMapping("/health-tips")
    public ResponseEntity<List<Map<String, Object>>> getHealthTips() {
        List<Map<String, Object>> tips = List.of(
            Map.of(
                "id", 1,
                "title", "Stay Hydrated",
                "description", "Drink at least 8-10 glasses of water daily to maintain good health",
                "category", "General Health",
                "icon", "💧"
            ),
            Map.of(
                "id", 2,
                "title", "Regular Exercise",
                "description", "30 minutes of daily exercise can significantly improve your health",
                "category", "Fitness",
                "icon", "🏃‍♂️"
            ),
            Map.of(
                "id", 3,
                "title", "Balanced Diet",
                "description", "Include fruits, vegetables, and whole grains in your daily meals",
                "category", "Nutrition",
                "icon", "🥗"
            ),
            Map.of(
                "id", 4,
                "title", "Regular Sleep",
                "description", "Get 7-8 hours of quality sleep every night for better health",
                "category", "Sleep",
                "icon", "😴"
            )
        );
        
        return ResponseEntity.ok(tips);
    }
}