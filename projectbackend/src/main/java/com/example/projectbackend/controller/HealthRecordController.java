package com.example.projectbackend.controller;

import com.example.projectbackend.model.HealthRecord;
import com.example.projectbackend.repository.HealthRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-records")
@CrossOrigin(origins = "*")
public class HealthRecordController {
    
    @Autowired
    private HealthRecordRepository healthRecordRepository;
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<HealthRecord>> getPatientRecords(@PathVariable Long patientId) {
        List<HealthRecord> records = healthRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
        return ResponseEntity.ok(records);
    }
    
    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addRecord(@RequestBody HealthRecord record) {
        HealthRecord saved = healthRecordRepository.save(record);
        return ResponseEntity.ok(Map.of("success", true, "record", saved));
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<HealthRecord>> getAllRecords() {
        List<HealthRecord> records = healthRecordRepository.findAll();
        return ResponseEntity.ok(records);
    }
}