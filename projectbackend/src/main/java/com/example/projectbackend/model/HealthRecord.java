package com.example.projectbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long patientId;
    
    private String recordType;
    private String title;
    private String value;
    private String unit;
    private String status;
    private LocalDateTime recordDate;
    private String doctorName;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}