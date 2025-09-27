package com.example.projectbackend.controller;

import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.model.Pharmacy;
import com.example.projectbackend.model.User;
import com.example.projectbackend.service.MedicineService;
import com.example.projectbackend.service.PharmacyService;
import com.example.projectbackend.service.UserService;
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
    
    @Autowired
    private PharmacyService pharmacyService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchMedicines(@RequestParam(required = false) String q) {
        List<Medicine> medicines = medicineService.searchMedicines(q);
        List<Map<String, Object>> results = medicines.stream().map(medicine -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", medicine.getId());
            result.put("name", medicine.getName());
            result.put("manufacturer", medicine.getManufacturer());
            result.put("category", medicine.getCategory());
            result.put("description", medicine.getDescription());
            result.put("price", medicine.getPrice());
            result.put("available", medicine.getAvailable());
            result.put("stock", medicine.getStock());
            result.put("dosage", medicine.getDosage());
            result.put("pharmacyId", medicine.getPharmacyId());
            
            // Get pharmacy information - try Pharmacy entity first, then User entity as fallback
            try {
                Pharmacy pharmacy = pharmacyService.findById(medicine.getPharmacyId());
                result.put("pharmacyName", pharmacy.getName());
                result.put("pharmacyAddress", pharmacy.getAddress());
                result.put("pharmacyContact", pharmacy.getContact());
                result.put("pharmacyRating", pharmacy.getRating());
                result.put("pharmacyHours", pharmacy.getOpenHours());
                result.put("is24Hours", pharmacy.getIs24Hours());
            } catch (Exception e) {
                // Fallback: try to get pharmacy info from User table
                try {
                    User pharmacyUser = userService.findById(medicine.getPharmacyId());
                    if (pharmacyUser != null && pharmacyUser.getRole() == User.Role.PHARMACY) {
                        result.put("pharmacyName", pharmacyUser.getPharmacyName() != null ? pharmacyUser.getPharmacyName() : pharmacyUser.getName());
                        result.put("pharmacyAddress", pharmacyUser.getAddress() != null ? pharmacyUser.getAddress() : "Address not available");
                        result.put("pharmacyContact", pharmacyUser.getPhone() != null ? pharmacyUser.getPhone() : "Contact not available");
                        result.put("pharmacyRating", 4.0);
                        result.put("pharmacyHours", "Contact for hours");
                        result.put("is24Hours", false);
                    } else {
                        throw new RuntimeException("No pharmacy found with ID: " + medicine.getPharmacyId());
                    }
                } catch (Exception fallbackError) {
                    result.put("pharmacyName", "Unknown Pharmacy");
                    result.put("pharmacyAddress", "Address not available");
                    result.put("pharmacyContact", "Contact not available");
                    result.put("pharmacyRating", 4.0);
                    result.put("pharmacyHours", "Contact for hours");
                    result.put("is24Hours", false);
                }
            }
            
            return result;
        }).toList();
        
        return ResponseEntity.ok(results);
    }
    
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addMedicine(@RequestBody Medicine medicine) {
        System.out.println("💊 Adding medicine: " + medicine.getName() + " for pharmacy ID: " + medicine.getPharmacyId());
        
        try {
            // Validate required fields
            if (medicine.getName() == null || medicine.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Medicine name is required"));
            }
            if (medicine.getPharmacyId() == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Pharmacy ID is required"));
            }
            if (medicine.getPrice() == null || medicine.getPrice() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Valid price is required"));
            }
            if (medicine.getStock() == null || medicine.getStock() < 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Valid stock quantity is required"));
            }
            
            // Set defaults for optional fields
            if (medicine.getAvailable() == null) {
                medicine.setAvailable(medicine.getStock() > 0);
            }
            if (medicine.getMinStockLevel() == null) {
                medicine.setMinStockLevel(10);
            }
            if (medicine.getManufacturer() == null) {
                medicine.setManufacturer("");
            }
            if (medicine.getCategory() == null) {
                medicine.setCategory("");
            }
            if (medicine.getDescription() == null) {
                medicine.setDescription("");
            }
            if (medicine.getDosage() == null) {
                medicine.setDosage("");
            }
            if (medicine.getSideEffects() == null) {
                medicine.setSideEffects("");
            }
            
            // Verify pharmacy exists - try both Pharmacy entity and User entity
            boolean pharmacyExists = false;
            try {
                pharmacyService.findById(medicine.getPharmacyId());
                pharmacyExists = true;
                System.out.println("✅ Pharmacy found in Pharmacy table");
            } catch (Exception e) {
                // Try to find pharmacy user
                try {
                    User pharmacyUser = userService.findById(medicine.getPharmacyId());
                    if (pharmacyUser != null && pharmacyUser.getRole() == User.Role.PHARMACY) {
                        pharmacyExists = true;
                        System.out.println("✅ Pharmacy user found in User table");
                    }
                } catch (Exception userError) {
                    System.out.println("❌ Pharmacy not found in either table");
                }
            }
            
            if (!pharmacyExists) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false, 
                    "message", "Pharmacy not found with ID: " + medicine.getPharmacyId() + ". Please ensure the pharmacy is registered."
                ));
            }
            
            Medicine saved = medicineService.save(medicine);
            System.out.println("✅ Medicine saved successfully with ID: " + saved.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Medicine added successfully",
                "medicine", saved,
                "medicineId", saved.getId()
            ));
        } catch (Exception e) {
            System.err.println("❌ Error adding medicine: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", "Failed to add medicine: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<Map<String, Object>> updateMedicine(@PathVariable Long id, @RequestBody Medicine medicine) {
        try {
            medicine.setId(id);
            Medicine updated = medicineService.save(medicine);
            return ResponseEntity.ok(Map.of("success", true, "medicine", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PutMapping("/update-stock/{id}")
    public ResponseEntity<Map<String, Object>> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer newStock = request.get("stock");
            Medicine updated = medicineService.updateStock(id, newStock);
            return ResponseEntity.ok(Map.of("success", true, "medicine", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Medicine>> getPharmacyMedicines(@PathVariable Long pharmacyId) {
        List<Medicine> medicines = medicineService.getMedicinesByPharmacy(pharmacyId);
        return ResponseEntity.ok(medicines);
    }
    
    @GetMapping("/low-stock/{pharmacyId}")
    public ResponseEntity<List<Medicine>> getLowStockMedicines(@PathVariable Long pharmacyId) {
        List<Medicine> medicines = medicineService.getLowStockMedicines(pharmacyId);
        return ResponseEntity.ok(medicines);
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Map<String, Object>> deleteMedicine(@PathVariable Long id) {
        try {
            medicineService.deleteMedicine(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Medicine deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
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
        
        return ResponseEntity.ok(response);
    }
}