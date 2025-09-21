package com.example.projectbackend.controller;

import com.example.projectbackend.model.User;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        User user = userService.authenticate(email, password);
        
        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().toString().toLowerCase(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "specialization", user.getSpecialization() != null ? user.getSpecialization() : "",
                "experience", user.getExperience() != null ? user.getExperience() : "",
                "pharmacyName", user.getPharmacyName() != null ? user.getPharmacyName() : ""
            ));
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> userData) {
        try {
            String email = (String) userData.get("email");
            String password = (String) userData.get("password");
            String name = (String) userData.get("name");
            String roleStr = (String) userData.get("role");
            
            if (userService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already exists"));
            }
            
            User.Role role = User.Role.valueOf(roleStr.toUpperCase());
            User user = new User(email, password, name, role);
            
            // Set role-specific fields
            if (userData.get("phone") != null) user.setPhone((String) userData.get("phone"));
            if (userData.get("address") != null) user.setAddress((String) userData.get("address"));
            if (userData.get("specialization") != null) user.setSpecialization((String) userData.get("specialization"));
            if (userData.get("experience") != null) user.setExperience((String) userData.get("experience"));
            if (userData.get("licenseNumber") != null) user.setLicenseNumber((String) userData.get("licenseNumber"));
            if (userData.get("pharmacyName") != null) user.setPharmacyName((String) userData.get("pharmacyName"));
            
            User savedUser = userService.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "name", savedUser.getName(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole().toString().toLowerCase()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getAllPatients() {
        try {
            var patients = userService.findByRole(User.Role.PATIENT);
            var patientList = patients.stream().map(patient -> Map.of(
                "id", patient.getId(),
                "name", patient.getName(),
                "email", patient.getEmail(),
                "phone", patient.getPhone() != null ? patient.getPhone() : "",
                "address", patient.getAddress() != null ? patient.getAddress() : ""
            )).toList();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "patients", patientList
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to fetch patients: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(@PathVariable Long userId, @RequestBody Map<String, Object> userData) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
            }
            
            // Update fields
            if (userData.get("name") != null) user.setName((String) userData.get("name"));
            if (userData.get("phone") != null) user.setPhone((String) userData.get("phone"));
            if (userData.get("address") != null) user.setAddress((String) userData.get("address"));
            if (userData.get("specialization") != null) user.setSpecialization((String) userData.get("specialization"));
            if (userData.get("experience") != null) user.setExperience((String) userData.get("experience"));
            if (userData.get("licenseNumber") != null) user.setLicenseNumber((String) userData.get("licenseNumber"));
            if (userData.get("pharmacyName") != null) user.setPharmacyName((String) userData.get("pharmacyName"));
            
            User savedUser = userService.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "name", savedUser.getName(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole().toString().toLowerCase(),
                "phone", savedUser.getPhone() != null ? savedUser.getPhone() : "",
                "address", savedUser.getAddress() != null ? savedUser.getAddress() : "",
                "specialization", savedUser.getSpecialization() != null ? savedUser.getSpecialization() : "",
                "experience", savedUser.getExperience() != null ? savedUser.getExperience() : "",
                "licenseNumber", savedUser.getLicenseNumber() != null ? savedUser.getLicenseNumber() : "",
                "pharmacyName", savedUser.getPharmacyName() != null ? savedUser.getPharmacyName() : ""
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Profile update failed: " + e.getMessage()));
        }
    }
}