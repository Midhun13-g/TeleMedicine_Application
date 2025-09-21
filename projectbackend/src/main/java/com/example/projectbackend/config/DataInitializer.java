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
        // No dummy users - users will register themselves
    }
    
    private void initializeMedicines() {
        // No dummy medicines - pharmacists will add their own
    }
}