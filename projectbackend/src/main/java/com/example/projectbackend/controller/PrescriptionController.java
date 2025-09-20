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

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {
    
    @Autowired
    private PrescriptionService prescriptionService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPrescription(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            Long doctorId = Long.valueOf(request.get("doctorId").toString());
            String medicines = (String) request.get("medicines");
            String notes = (String) request.get("notes");
            
            User patient = userService.findById(patientId);
            User doctor = userService.findById(doctorId);
            
            if (patient == null || doctor == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid patient or doctor"));
            }
            
            Prescription prescription = new Prescription();
            prescription.setPatient(patient);
            prescription.setDoctor(doctor);
            prescription.setMedicines(medicines);
            prescription.setNotes(notes);
            
            Prescription saved = prescriptionService.save(prescription);
            
            return ResponseEntity.ok(Map.of("success", true, "prescriptionId", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientPrescriptions(@PathVariable Long patientId) {
        User patient = userService.findById(patientId);
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
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
}