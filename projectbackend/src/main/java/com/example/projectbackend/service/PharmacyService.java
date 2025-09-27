package com.example.projectbackend.service;

import com.example.projectbackend.model.Pharmacy;
import com.example.projectbackend.repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PharmacyService {
    
    @Autowired
    private PharmacyRepository pharmacyRepository;
    
    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepository.findAll();
    }
    
    public Pharmacy save(Pharmacy pharmacy) {
        return pharmacyRepository.save(pharmacy);
    }
    
    public Pharmacy findById(Long id) {
        return pharmacyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
    }
    
    public List<Pharmacy> searchPharmacies(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllPharmacies();
        }
        return pharmacyRepository.findByNameContainingIgnoreCase(query.trim());
    }
}