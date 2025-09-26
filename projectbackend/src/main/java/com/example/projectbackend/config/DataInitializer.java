package com.example.projectbackend.config;

import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.model.User;
import com.example.projectbackend.service.MedicineService;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private MedicineService medicineService;
    
    @Autowired
    private UserService userService;
    
    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeMedicines();
    }
    
    private void initializeUsers() {
        // Create default admin account if it doesn't exist
        if (!userService.existsByEmail("admin@teleasha.com")) {
            User admin = new User("admin@teleasha.com", "admin123", "System Administrator", User.Role.ADMIN);
            admin.setPhone("+91-9999999999");
            admin.setAddress("TeleAsha Headquarters, Gujarat, India");
            userService.save(admin);
            System.out.println("✅ Default admin account created: admin@teleasha.com / admin123");
        }
    }
    
    private void initializeMedicines() {
        // No dummy medicines - pharmacists will add their own
    }
}