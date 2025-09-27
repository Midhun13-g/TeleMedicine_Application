package com.example.projectbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "pharmacies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacy {
    @Id
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String address;
    private String contact;
    private Double latitude;
    private Double longitude;
    private String openHours;
    private Boolean is24Hours = false;
    private Double rating = 4.0;
}