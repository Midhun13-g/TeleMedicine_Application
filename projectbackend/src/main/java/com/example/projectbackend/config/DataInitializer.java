package com.example.projectbackend.config;

import com.example.projectbackend.model.User;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // Create demo users if they don't exist
        if (!userService.existsByEmail("patient@teleasha.com")) {
            User patient = new User("patient@teleasha.com", "patient123", "John Patient", User.Role.PATIENT);
            patient.setPhone("+91 9876543210");
            patient.setAddress("123 Village Road, Gujarat");
            userService.save(patient);
        }

        if (!userService.existsByEmail("doctor@teleasha.com")) {
            User doctor = new User("doctor@teleasha.com", "doctor123", "Dr. Sarah Smith", User.Role.DOCTOR);
            doctor.setPhone("+91 9876543211");
            doctor.setSpecialization("General Medicine");
            doctor.setLicenseNumber("DOC123456");
            userService.save(doctor);
        }

        if (!userService.existsByEmail("pharmacy@teleasha.com")) {
            User pharmacy = new User("pharmacy@teleasha.com", "pharmacy123", "MediCare Pharmacy", User.Role.PHARMACY);
            pharmacy.setPhone("+91 9876543212");
            pharmacy.setPharmacyName("MediCare Pharmacy");
            pharmacy.setLicenseNumber("PHARM123456");
            pharmacy.setAddress("456 Main Street, Gujarat");
            userService.save(pharmacy);
        }

        if (!userService.existsByEmail("admin@teleasha.com")) {
            User admin = new User("admin@teleasha.com", "admin123", "Admin User", User.Role.ADMIN);
            admin.setPhone("+91 9876543213");
            userService.save(admin);
        }
    }
}