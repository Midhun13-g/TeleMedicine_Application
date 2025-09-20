package com.example.projectbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacies")
@CrossOrigin(origins = "*")
public class PharmacyController {
    
    @GetMapping("/nearby")
    public ResponseEntity<List<Map<String, Object>>> getNearbyPharmacies(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        
        List<Map<String, Object>> pharmacies = List.of(
            Map.of(
                "id", 1,
                "name", "Apollo Pharmacy",
                "address", "123 Main Street, City Center",
                "contact", "+91-9876543210",
                "distance", "0.5 km",
                "rating", 4.5,
                "openHours", "24 Hours",
                "is24Hours", true
            ),
            Map.of(
                "id", 2,
                "name", "MedPlus",
                "address", "456 Park Avenue, Downtown",
                "contact", "+91-9876543211",
                "distance", "1.2 km",
                "rating", 4.2,
                "openHours", "8:00 AM - 10:00 PM",
                "is24Hours", false
            ),
            Map.of(
                "id", 3,
                "name", "Wellness Pharmacy",
                "address", "789 Health Street, Medical District",
                "contact", "+91-9876543212",
                "distance", "2.1 km",
                "rating", 4.7,
                "openHours", "9:00 AM - 9:00 PM",
                "is24Hours", false
            )
        );
        
        return ResponseEntity.ok(pharmacies);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchPharmacies(@RequestParam String query) {
        // Mock search results
        List<Map<String, Object>> results = List.of(
            Map.of(
                "id", 1,
                "name", "Apollo Pharmacy",
                "address", "Multiple locations available",
                "contact", "+91-1800-123-4567",
                "rating", 4.5
            )
        );
        
        return ResponseEntity.ok(results);
    }
}