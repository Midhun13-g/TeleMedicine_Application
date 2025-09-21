package com.example.projectbackend.controller;

import com.example.projectbackend.model.Prescription;
import com.example.projectbackend.model.User;
import com.example.projectbackend.service.PrescriptionService;
import com.example.projectbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import com.example.projectbackend.repository.PrescriptionRepository;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    
    @Autowired
    private PrescriptionService prescriptionService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PrescriptionRepository prescriptionRepository;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPrescription(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Creating prescription with data: " + request);
            
            Long patientId = Long.valueOf(request.get("patientId").toString());
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            String medicines = (String) request.get("medicines");
            String notes = (String) request.get("notes");
            
            System.out.println("Patient ID: " + patientId + ", Doctor ID: " + doctorId);
            
            User patient = userService.findById(patientId);
            User doctor = userService.findById(doctorId);
            
            if (patient == null) {
                System.out.println("Patient not found with ID: " + patientId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Patient not found"));
            }
            if (doctor == null) {
                System.out.println("Doctor not found with ID: " + doctorId);
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Doctor not found"));
            }
            
            Prescription prescription = new Prescription();
            prescription.setPatient(patient);
            prescription.setDoctor(doctor);
            prescription.setMedicines(medicines);
            prescription.setNotes(notes);
            
            Prescription saved = prescriptionService.save(prescription);
            System.out.println("Prescription saved with ID: " + saved.getId());
            
            return ResponseEntity.ok(Map.of("success", true, "prescriptionId", saved.getId()));
        } catch (Exception e) {
            System.out.println("Error creating prescription: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientPrescriptions(@PathVariable String patientId) {
        User patient = userService.findById(Long.valueOf(patientId));
        if (patient == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Prescription> prescriptions = prescriptionService.findByPatient(patient);
        List<Map<String, Object>> result = prescriptions.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("doctorName", p.getDoctor().getName());
            map.put("medicines", p.getMedicines());
            map.put("notes", p.getNotes());
            map.put("status", p.getStatus().toString().toLowerCase());
            map.put("date", p.getCreatedAt().toString());
            if (p.getTakenAt() != null) {
                map.put("takenAt", p.getTakenAt().toString());
            }
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{prescriptionId}/mark-taken")
    public ResponseEntity<Map<String, Object>> markAsTaken(@PathVariable String prescriptionId) {
        try {
            Prescription prescription = prescriptionRepository.findById(Long.valueOf(prescriptionId)).orElse(null);
            if (prescription == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Prescription not found"
                ));
            }
            
            prescription.setStatus(Prescription.Status.TAKEN);
            prescription.setTakenAt(LocalDateTime.now());
            Prescription saved = prescriptionRepository.save(prescription);
            
            System.out.println("✅ Prescription " + prescriptionId + " marked as taken by patient " + prescription.getPatient().getName());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Prescription marked as taken",
                "takenAt", saved.getTakenAt().toString(),
                "prescriptionId", saved.getId(),
                "doctorId", saved.getDoctor().getId()
            ));
        } catch (Exception e) {
            System.err.println("Error marking prescription as taken: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to mark prescription as taken: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/taken-notifications/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getTakenNotifications(@PathVariable String doctorId) {
        try {
            System.out.println("🔍 Checking taken notifications for doctor ID: " + doctorId);
            
            List<Prescription> allPrescriptions = prescriptionRepository.findAll();
            System.out.println("📋 Total prescriptions in database: " + allPrescriptions.size());
            
            allPrescriptions.forEach(p -> {
                System.out.println("  - Prescription ID: " + p.getId() + 
                                 ", Doctor ID: " + p.getDoctor().getId() + 
                                 ", Status: " + p.getStatus() + 
                                 ", TakenAt: " + p.getTakenAt());
            });
            
            List<Prescription> takenPrescriptions = allPrescriptions.stream()
                .filter(p -> p.getDoctor().getId().equals(doctorId) && 
                           p.getStatus() == Prescription.Status.TAKEN &&
                           p.getTakenAt() != null)
                .collect(Collectors.toList());
            
            System.out.println("💊 Found " + takenPrescriptions.size() + " taken prescriptions for doctor " + doctorId);
            
            List<Map<String, Object>> notifications = takenPrescriptions.stream().map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("prescriptionId", p.getId());
                map.put("patientName", p.getPatient().getName());
<<<<<<< HEAD
                map.put("patientId", p.getPatient().getId());
                map.put("takenAt", p.getTakenAt().toString());
                map.put("medicines", p.getMedicines());
=======
                map.put("medicines", p.getMedicines());
                map.put("takenAt", p.getTakenAt().toString());
>>>>>>> 358e937bb180700f6349b104620b974116a14809
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error getting taken notifications: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}