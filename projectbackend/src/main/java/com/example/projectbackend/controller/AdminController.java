package com.example.projectbackend.controller;

import com.example.projectbackend.model.User;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userService.findByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        List<User> allUsers = userService.getAllUsers();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", allUsers.size());
        stats.put("totalPatients", allUsers.stream().filter(u -> u.getRole() == User.Role.PATIENT).count());
        stats.put("totalDoctors", allUsers.stream().filter(u -> u.getRole() == User.Role.DOCTOR).count());
        stats.put("totalPharmacies", allUsers.stream().filter(u -> u.getRole() == User.Role.PHARMACY).count());
        stats.put("totalAdmins", allUsers.stream().filter(u -> u.getRole() == User.Role.ADMIN).count());
        
        return ResponseEntity.ok(stats);
    }
}