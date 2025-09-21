package com.example.projectbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "medicines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String manufacturer;
    private String category;
    private String description;
    private Double price;
    private Boolean available = true;
    private String dosage;
    private String sideEffects;
    
    // Stock management fields
    private Integer stock = 0;
    private Integer minStockLevel = 10;
    private String expiryDate;
    private String batchNumber;
    
    // Pharmacy association
    private Long pharmacyId;
    
    public boolean isLowStock() {
        return stock != null && stock < minStockLevel;
    }
    
    public boolean isOutOfStock() {
        return stock == null || stock == 0;
    }
}