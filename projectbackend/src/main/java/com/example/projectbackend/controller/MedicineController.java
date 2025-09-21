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
    
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addMedicine(@RequestBody Medicine medicine) {
        try {
            Medicine saved = medicineService.save(medicine);
            return ResponseEntity.ok(Map.of("success", true, "medicine", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
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