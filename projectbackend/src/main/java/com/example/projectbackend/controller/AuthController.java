package com.example.projectbackend.controller;

import com.example.projectbackend.model.User;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping({"/api/auth", "/api/admin"})
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            System.out.println("Login attempt for email: " + email);
            
            User user = userService.authenticate(email, password);
            
            if (user != null) {
                System.out.println("Login successful for user: " + user.getName());
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
                System.out.println("Login failed for email: " + email);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid credentials"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Login error: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> userData) {
        try {
            String email = (String) userData.get("email");
            String password = (String) userData.get("password");
            String name = (String) userData.get("name");
            String roleStr = (String) userData.get("role");
            
            System.out.println("Registration attempt for email: " + email + ", role: " + roleStr);
            
            if (userService.existsByEmail(email)) {
                System.out.println("Registration failed: Email already exists - " + email);
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
            System.out.println("Registration successful for user: " + savedUser.getName());
            
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
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
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

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            var users = userService.getAllUsers();
            var userList = users.stream().map(user -> {
                var userMap = new HashMap<String, Object>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("role", user.getRole().toString());
                userMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
                userMap.put("address", user.getAddress() != null ? user.getAddress() : "");
                userMap.put("specialization", user.getSpecialization() != null ? user.getSpecialization() : "");
                userMap.put("pharmacyName", user.getPharmacyName() != null ? user.getPharmacyName() : "");
                userMap.put("suspended", user.isSuspended());
                userMap.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
                return userMap;
            }).toList();
            
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to fetch users: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
            }
            
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to delete user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
            }
            
            userService.suspendUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "User suspended successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to suspend user: " + e.getMessage()));
        }
    }
    
    @PutMapping("/users/{userId}/unsuspend")
    public ResponseEntity<?> unsuspendUser(@PathVariable Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "User not found"));
            }
            
            userService.unsuspendUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "User unsuspended successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to unsuspend user: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        try {
            var users = userService.getAllUsers();
            if (users == null) {
                users = new java.util.ArrayList<>();
            }
            
            long totalPatients = users.stream().filter(u -> u.getRole() == User.Role.PATIENT).count();
            long totalDoctors = users.stream().filter(u -> u.getRole() == User.Role.DOCTOR).count();
            long totalPharmacies = users.stream().filter(u -> u.getRole() == User.Role.PHARMACY).count();
            long totalAdmins = users.stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
            
            return ResponseEntity.ok(Map.of(
                "totalUsers", users.size(),
                "totalPatients", (int)totalPatients,
                "totalDoctors", (int)totalDoctors,
                "totalPharmacies", (int)totalPharmacies,
                "totalAdmins", (int)totalAdmins
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to fetch stats: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "OK", "message", "Admin API is running"));
    }
}