package com.example.projectbackend.controller;

import com.example.projectbackend.model.Report;
import com.example.projectbackend.repository.ReportRepository;
import com.example.projectbackend.service.SocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private SocketService socketService;
    
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitReport(@RequestBody Report report) {
        Map<String, Object> response = new HashMap<>();
        try {
            report.setStatus("PENDING");
            Report savedReport = reportRepository.save(report);
            
            socketService.emitReportStatusUpdate(savedReport.getId(), savedReport.getReporterId(), "PENDING");
            
            response.put("success", true);
            response.put("reportId", savedReport.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Report>> getAllReports() {
        List<Report> reports = reportRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(reports);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Report>> getUserReports(@PathVariable String userId) {
        List<Report> reports = reportRepository.findByReporterIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(reports);
    }
    
    @PutMapping("/{reportId}/status")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
            @PathVariable Long reportId, 
            @RequestBody Map<String, String> statusUpdate) {
        Map<String, Object> response = new HashMap<>();
        try {
            Report report = reportRepository.findById(reportId).orElse(null);
            if (report != null) {
                String newStatus = statusUpdate.get("status");
                report.setStatus(newStatus);
                reportRepository.save(report);
                
                socketService.emitReportStatusUpdate(reportId, report.getReporterId(), newStatus);
                
                response.put("success", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}