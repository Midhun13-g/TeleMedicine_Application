package com.example.projectbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AccessDemoController {

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "Admin Dashboard: Only accessible by ADMIN";
    }

    @GetMapping("/user/dashboard")
    public String userDashboard() {
        return "User Dashboard: Accessible by USER and ADMIN";
    }

    @GetMapping("/common")
    public String common() {
        return "Common: Accessible by any authenticated user";
    }
}
