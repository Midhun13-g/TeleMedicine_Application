package com.example.projectbackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String reporterId;
    private String reporterName;
    private String reporterType; // PATIENT, DOCTOR
    private String reportType; // fake-doctor, fake-pharmacy, doctor-feedback, user-report
    private String reportedUserIdOrName;
    private String reportedUserType;
    private String issueType;
    private Integer rating;
    private String description;
    private String status = "PENDING"; // PENDING, REVIEWED, RESOLVED
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // Constructors
    public Report() {}
    
    public Report(String reporterId, String reporterName, String reporterType, String reportType, 
                  String reportedUserIdOrName, String issueType, String description) {
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.reporterType = reporterType;
        this.reportType = reportType;
        this.reportedUserIdOrName = reportedUserIdOrName;
        this.issueType = issueType;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }
    
    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
    
    public String getReporterType() { return reporterType; }
    public void setReporterType(String reporterType) { this.reporterType = reporterType; }
    
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    
    public String getReportedUserIdOrName() { return reportedUserIdOrName; }
    public void setReportedUserIdOrName(String reportedUserIdOrName) { this.reportedUserIdOrName = reportedUserIdOrName; }
    
    public String getReportedUserType() { return reportedUserType; }
    public void setReportedUserType(String reportedUserType) { this.reportedUserType = reportedUserType; }
    
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}