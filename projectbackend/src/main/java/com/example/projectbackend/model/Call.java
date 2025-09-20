package com.example.projectbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "calls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String callerId;
    
    @Column(nullable = false)
    private String receiverId;
    
    @Enumerated(EnumType.STRING)
    private CallType type;
    
    @Enumerated(EnumType.STRING)
    private CallStatus status;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String sessionId;
    
    public enum CallType {
        AUDIO, VIDEO
    }
    
    public enum CallStatus {
        INITIATED, RINGING, ACCEPTED, REJECTED, ENDED, MISSED
    }
}