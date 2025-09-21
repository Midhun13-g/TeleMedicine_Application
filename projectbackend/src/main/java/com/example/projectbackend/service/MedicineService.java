package com.example.projectbackend.service;

import com.example.projectbackend.model.Medicine;
import com.example.projectbackend.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MedicineService {
    
    @Autowired
    private MedicineRepository medicineRepository;
    
    public List<Medicine> searchMedicines(String query) {
        if (query == null || query.trim().isEmpty()) {
            return medicineRepository.findByAvailableTrue();
        }
        return medicineRepository.searchMedicines(query.trim());
    }
    
    public List<Medicine> getAllAvailableMedicines() {
        return medicineRepository.findByAvailableTrue();
    }
    
    public Medicine save(Medicine medicine) {
        return medicineRepository.save(medicine);
    }
    
    public List<Medicine> getMedicinesByPharmacy(Long pharmacyId) {
        return medicineRepository.findByPharmacyId(pharmacyId);
    }
    
    public List<Medicine> getLowStockMedicines(Long pharmacyId) {
        return medicineRepository.findLowStockMedicines(pharmacyId);
    }
    
    public Medicine updateStock(Long medicineId, Integer newStock) {
        Medicine medicine = medicineRepository.findById(medicineId)
            .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setStock(newStock);
        medicine.setAvailable(newStock > 0);
        return medicineRepository.save(medicine);
    }
    
    public void deleteMedicine(Long medicineId) {
        medicineRepository.deleteById(medicineId);
    }
    
    public Medicine findById(Long id) {
        return medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found"));
    }
}