package com.example.projectbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private User patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;
    
    @Column(columnDefinition = "TEXT")
    private String medicines;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDateTime createdAt;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
    
    private LocalDateTime takenAt;
    
    public enum Status {
        ACTIVE, TAKEN, COMPLETED, CANCELLED
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}