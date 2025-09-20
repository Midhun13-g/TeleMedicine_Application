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
        // Sample Doctors
        if (!userService.existsByEmail("dr.sharma@teleasha.com")) {
            User doctor1 = new User("dr.sharma@teleasha.com", "password123", "Dr. Rajesh Sharma", User.Role.DOCTOR);
            doctor1.setPhone("+91-9876543210");
            doctor1.setAddress("Apollo Hospital, Ahmedabad, Gujarat");
            doctor1.setSpecialization("Cardiology");
            doctor1.setLicenseNumber("MCI-12345");
            userService.save(doctor1);
        }
        
        if (!userService.existsByEmail("dr.patel@teleasha.com")) {
            User doctor2 = new User("dr.patel@teleasha.com", "password123", "Dr. Priya Patel", User.Role.DOCTOR);
            doctor2.setPhone("+91-9876543211");
            doctor2.setAddress("Sterling Hospital, Vadodara, Gujarat");
            doctor2.setSpecialization("Pediatrics");
            doctor2.setLicenseNumber("MCI-12346");
            userService.save(doctor2);
        }
        
        if (!userService.existsByEmail("dr.mehta@teleasha.com")) {
            User doctor3 = new User("dr.mehta@teleasha.com", "password123", "Dr. Amit Mehta", User.Role.DOCTOR);
            doctor3.setPhone("+91-9876543212");
            doctor3.setAddress("Civil Hospital, Surat, Gujarat");
            doctor3.setSpecialization("General Medicine");
            doctor3.setLicenseNumber("MCI-12347");
            userService.save(doctor3);
        }
        
        if (!userService.existsByEmail("dr.joshi@teleasha.com")) {
            User doctor4 = new User("dr.joshi@teleasha.com", "password123", "Dr. Kavita Joshi", User.Role.DOCTOR);
            doctor4.setPhone("+91-9876543213");
            doctor4.setAddress("Zydus Hospital, Rajkot, Gujarat");
            doctor4.setSpecialization("Gynecology");
            doctor4.setLicenseNumber("MCI-12348");
            userService.save(doctor4);
        }
        
        // Sample Patients
        if (!userService.existsByEmail("patient1@teleasha.com")) {
            User patient1 = new User("patient1@teleasha.com", "password123", "Ramesh Kumar", User.Role.PATIENT);
            patient1.setPhone("+91-9876543220");
            patient1.setAddress("Village Kheda, Anand District, Gujarat");
            userService.save(patient1);
        }
        
        if (!userService.existsByEmail("patient2@teleasha.com")) {
            User patient2 = new User("patient2@teleasha.com", "password123", "Sunita Devi", User.Role.PATIENT);
            patient2.setPhone("+91-9876543221");
            patient2.setAddress("Village Bharuch, Bharuch District, Gujarat");
            userService.save(patient2);
        }
        
        if (!userService.existsByEmail("patient3@teleasha.com")) {
            User patient3 = new User("patient3@teleasha.com", "password123", "Kiran Patel", User.Role.PATIENT);
            patient3.setPhone("+91-9876543222");
            patient3.setAddress("Village Dahod, Dahod District, Gujarat");
            userService.save(patient3);
        }
        
        // Sample Admin
        if (!userService.existsByEmail("admin@teleasha.com")) {
            User admin = new User("admin@teleasha.com", "admin123", "TeleAsha Admin", User.Role.ADMIN);
            admin.setPhone("+91-9876543200");
            admin.setAddress("TeleAsha Headquarters, Gandhinagar, Gujarat");
            userService.save(admin);
        }
    }
    
    private void initializeMedicines() {
        if (medicineService.getAllAvailableMedicines().isEmpty()) {
            Medicine[] medicines = {
                new Medicine(null, "Paracetamol", "GSK", "Pain Relief", "For fever and pain relief", 25.0, true, "500mg", "Nausea, skin rash"),
                new Medicine(null, "Azithromycin", "Pfizer", "Antibiotic", "Bacterial infection treatment", 120.0, true, "250mg", "Stomach upset, diarrhea"),
                new Medicine(null, "Cetirizine", "Dr. Reddy's", "Antihistamine", "Allergy relief", 45.0, true, "10mg", "Drowsiness, dry mouth"),
                new Medicine(null, "Amoxicillin", "Cipla", "Antibiotic", "Bacterial infection treatment", 85.0, true, "500mg", "Nausea, diarrhea"),
                new Medicine(null, "Ibuprofen", "Johnson & Johnson", "Pain Relief", "Anti-inflammatory", 35.0, true, "400mg", "Stomach irritation"),
                new Medicine(null, "Omeprazole", "Sun Pharma", "Antacid", "Reduces stomach acid", 65.0, true, "20mg", "Headache, diarrhea"),
                new Medicine(null, "Metformin", "Lupin", "Diabetes", "Blood sugar control", 45.0, true, "500mg", "Nausea, stomach upset"),
                new Medicine(null, "Atorvastatin", "Ranbaxy", "Cholesterol", "Lowers cholesterol", 95.0, true, "10mg", "Muscle pain, liver problems")
            };
            
            for (Medicine medicine : medicines) {
                medicineService.save(medicine);
            }
        }
    }
}