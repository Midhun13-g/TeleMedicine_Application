package com.example.projectbackend.service;

import com.example.projectbackend.model.Prescription;
import com.example.projectbackend.model.User;
import com.example.projectbackend.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrescriptionService {
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    
    public Prescription save(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }
    
    public List<Prescription> findByPatient(User patient) {
        return prescriptionRepository.findByPatient(patient);
    }
    
    public List<Prescription> findByDoctor(User doctor) {
        return prescriptionRepository.findByDoctor(doctor);
    }
    
    public List<Prescription> findActiveByPatient(User patient) {
        return prescriptionRepository.findByPatientAndStatus(patient, Prescription.Status.ACTIVE);
    }
}