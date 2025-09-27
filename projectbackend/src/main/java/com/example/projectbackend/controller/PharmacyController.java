package com.example.projectbackend.controller;

import com.example.projectbackend.model.Pharmacy;
import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.service.PharmacyService;
import com.example.projectbackend.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/pharmacies")
@CrossOrigin(origins = "*")
public class PharmacyController {
    
    @Autowired
    private PharmacyService pharmacyService;
    
    @Autowired
    private MedicineService medicineService;
    
    @GetMapping
    public ResponseEntity<List<Pharmacy>> getAllPharmacies() {
        return ResponseEntity.ok(pharmacyService.getAllPharmacies());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Pharmacy> getPharmacyById(@PathVariable Long id) {
        return ResponseEntity.ok(pharmacyService.findById(id));
    }
    
    @GetMapping("/{id}/medicines")
    public ResponseEntity<List<Medicine>> getPharmacyMedicines(@PathVariable Long id) {
        return ResponseEntity.ok(medicineService.getMedicinesByPharmacy(id));
    }
    
    @GetMapping("/medicine-availability/{medicineName}")
    public ResponseEntity<List<Map<String, Object>>> getMedicineAvailability(@PathVariable String medicineName) {
        System.out.println("🔍 Checking availability for medicine: " + medicineName);
        
        List<Pharmacy> allPharmacies = pharmacyService.getAllPharmacies();
        System.out.println("📋 Found " + allPharmacies.size() + " pharmacies in database");
        
        List<Map<String, Object>> availability = allPharmacies.stream()
            .map(pharmacy -> {
                System.out.println("🏥 Checking pharmacy: " + pharmacy.getName() + " (ID: " + pharmacy.getId() + ")");
                
                List<Medicine> medicines = medicineService.getMedicinesByPharmacy(pharmacy.getId());
                System.out.println("  💊 Found " + medicines.size() + " medicines in this pharmacy");
                
                Medicine medicine = medicines.stream()
                    .filter(m -> {
                        boolean matches = m.getName().toLowerCase().contains(medicineName.toLowerCase());
                        System.out.println("    🔍 Medicine: " + m.getName() + " matches: " + matches);
                        return matches;
                    })
                    .findFirst()
                    .orElse(null);
                
                Map<String, Object> result = new HashMap<>();
                result.put("pharmacyId", pharmacy.getId());
                result.put("pharmacyName", pharmacy.getName());
                result.put("address", pharmacy.getAddress());
                result.put("contact", pharmacy.getContact());
                result.put("rating", pharmacy.getRating());
                result.put("openHours", pharmacy.getOpenHours());
                result.put("is24Hours", pharmacy.getIs24Hours());
                result.put("available", medicine != null && medicine.getAvailable() && medicine.getStock() > 0);
                result.put("stock", medicine != null ? medicine.getStock() : 0);
                result.put("price", medicine != null ? medicine.getPrice() : null);
                result.put("medicineName", medicine != null ? medicine.getName() : null);
                result.put("manufacturer", medicine != null ? medicine.getManufacturer() : null);
                
                System.out.println("  ✅ Result for " + pharmacy.getName() + ": available=" + result.get("available") + ", stock=" + result.get("stock"));
                return result;
            })
            .toList();
        
        System.out.println("📊 Returning " + availability.size() + " pharmacy availability results");
        return ResponseEntity.ok(availability);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Pharmacy>> searchPharmacies(@RequestParam String query) {
        return ResponseEntity.ok(pharmacyService.searchPharmacies(query));
    }
    
    @GetMapping("/medicine-search/{medicineName}")
    public ResponseEntity<List<Map<String, Object>>> searchMedicineInPharmacies(@PathVariable String medicineName) {
        List<Pharmacy> allPharmacies = pharmacyService.getAllPharmacies();
        List<Map<String, Object>> results = new ArrayList<>();
        
        for (Pharmacy pharmacy : allPharmacies) {
            List<Medicine> medicines = medicineService.getMedicinesByPharmacy(pharmacy.getId());
            for (Medicine medicine : medicines) {
                if (medicine.getName().toLowerCase().contains(medicineName.toLowerCase()) && 
                    medicine.getAvailable() && medicine.getStock() > 0) {
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("medicineId", medicine.getId());
                    result.put("medicineName", medicine.getName());
                    result.put("category", medicine.getCategory());
                    result.put("price", medicine.getPrice());
                    result.put("stock", medicine.getStock());
                    result.put("manufacturer", medicine.getManufacturer());
                    result.put("dosage", medicine.getDosage());
                    
                    result.put("pharmacyId", pharmacy.getId());
                    result.put("pharmacyName", pharmacy.getName());
                    result.put("pharmacyAddress", pharmacy.getAddress());
                    result.put("pharmacyContact", pharmacy.getContact());
                    result.put("pharmacyRating", pharmacy.getRating());
                    result.put("pharmacyHours", pharmacy.getOpenHours());
                    result.put("pharmacy24Hours", pharmacy.getIs24Hours());
                    
                    results.add(result);
                }
            }
        }
        
        return ResponseEntity.ok(results);
    }
}