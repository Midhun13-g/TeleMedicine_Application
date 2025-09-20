package com.example.projectbackend.controller;

import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {
    
    @Autowired
    private MedicineService medicineService;
    
    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam(required = false) String q) {
        List<Medicine> medicines = medicineService.searchMedicines(q);
        return ResponseEntity.ok(medicines);
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<Map<String, Object>>> getPopularMedicines() {
        List<Map<String, Object>> popular = List.of(
            Map.of("name", "Paracetamol", "category", "Pain Relief", "available", true, "price", 25.0),
            Map.of("name", "Azithromycin", "category", "Antibiotic", "available", true, "price", 120.0),
            Map.of("name", "Cetirizine", "category", "Antihistamine", "available", true, "price", 45.0),
            Map.of("name", "Amoxicillin", "category", "Antibiotic", "available", true, "price", 85.0),
            Map.of("name", "Ibuprofen", "category", "Pain Relief", "available", true, "price", 35.0)
        );
        return ResponseEntity.ok(popular);
    }
    
    @GetMapping("/availability/{medicineName}")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable String medicineName) {
        List<Medicine> medicines = medicineService.searchMedicines(medicineName);
        boolean available = !medicines.isEmpty() && medicines.get(0).getAvailable();
        
        Map<String, Object> response = new HashMap<>();
        response.put("medicine", medicineName);
        response.put("available", available);
        response.put("nearbyPharmacies", List.of(
            Map.of("name", "Apollo Pharmacy", "distance", "0.5 km", "contact", "+91-9876543210"),
            Map.of("name", "MedPlus", "distance", "1.2 km", "contact", "+91-9876543211"),
            Map.of("name", "Wellness Pharmacy", "distance", "2.1 km", "contact", "+91-9876543212")
        ));
        
        return ResponseEntity.ok(response);
    }
}