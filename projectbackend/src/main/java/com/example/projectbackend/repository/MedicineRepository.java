package com.example.projectbackend.repository;

import com.example.projectbackend.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByAvailableTrue();
    List<Medicine> findByPharmacyId(Long pharmacyId);
    
    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.category) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Medicine> searchMedicines(@Param("search") String search);
    
    @Query("SELECT m FROM Medicine m WHERE m.pharmacyId = :pharmacyId AND m.stock < m.minStockLevel")
    List<Medicine> findLowStockMedicines(@Param("pharmacyId") Long pharmacyId);
    
    @Query("SELECT m FROM Medicine m WHERE m.pharmacyId = :pharmacyId AND m.stock = 0")
    List<Medicine> findOutOfStockMedicines(@Param("pharmacyId") Long pharmacyId);
}