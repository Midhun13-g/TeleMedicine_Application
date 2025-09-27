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
    
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(length = 255)
    private String manufacturer = "";
    
    @Column(length = 100)
    private String category = "";
    
    @Column(length = 1000)
    private String description = "";
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private Boolean available = true;
    
    @Column(length = 100)
    private String dosage = "";
    
    @Column(length = 500)
    private String sideEffects = "";
    
    // Stock management fields
    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(nullable = false)
    private Integer minStockLevel = 10;
    
    @Column(length = 20)
    private String expiryDate;
    
    @Column(length = 50)
    private String batchNumber;
    
    // Pharmacy association
    @Column(nullable = false)
    private Long pharmacyId;
    
    public boolean isLowStock() {
        return stock != null && stock < minStockLevel;
    }
    
    public boolean isOutOfStock() {
        return stock == null || stock == 0;
    }
}