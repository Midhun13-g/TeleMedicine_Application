package com.example.projectbackend.service;

import com.example.projectbackend.model.Call;
import com.example.projectbackend.repository.CallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CallService {
    
    @Autowired
    private CallRepository callRepository;
    
    private final Map<String, Boolean> doctorPresence = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> consultations = new ConcurrentHashMap<>();
    
    public Call initiateCall(String callerId, String receiverId, Call.CallType type) {
        Call call = new Call();
        call.setCallerId(callerId);
        call.setReceiverId(receiverId);
        call.setType(type);
        call.setStatus(Call.CallStatus.INITIATED);
        call.setStartTime(LocalDateTime.now());
        call.setSessionId(UUID.randomUUID().toString());
        return callRepository.save(call);
    }
    
    public Call acceptCall(Long callId) {
        Call call = callRepository.findById(callId).orElseThrow();
        call.setStatus(Call.CallStatus.ACCEPTED);
        return callRepository.save(call);
    }
    
    public Call rejectCall(Long callId) {
        Call call = callRepository.findById(callId).orElseThrow();
        call.setStatus(Call.CallStatus.REJECTED);
        call.setEndTime(LocalDateTime.now());
        return callRepository.save(call);
    }
    
    public Call endCall(Long callId) {
        Call call = callRepository.findById(callId).orElseThrow();
        call.setStatus(Call.CallStatus.ENDED);
        call.setEndTime(LocalDateTime.now());
        return callRepository.save(call);
    }
    
    public List<Call> getUserCalls(String userId) {
        return callRepository.findByCallerIdOrReceiverId(userId, userId);
    }
    
    public List<Call> getIncomingCalls(String userId) {
        return callRepository.findByReceiverIdAndStatus(userId, Call.CallStatus.INITIATED);
    }
    
    public void setDoctorOnline(String doctorId, boolean online) {
        doctorPresence.put(doctorId, online);
    }
    
    public List<String> getAvailableDoctors() {
        return doctorPresence.entrySet().stream()
            .filter(Map.Entry::getValue)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
    
    public String requestConsultation(String patientId, String doctorId) {
        String consultationId = UUID.randomUUID().toString();
        Map<String, Object> consultation = new HashMap<>();
        consultation.put("patientId", patientId);
        consultation.put("doctorId", doctorId);
        consultation.put("status", "requested");
        consultation.put("timestamp", LocalDateTime.now());
        consultations.put(consultationId, consultation);
        return consultationId;
    }
    
    public String acceptConsultation(String consultationId) {
        Map<String, Object> consultation = consultations.get(consultationId);
        if (consultation != null) {
            consultation.put("status", "accepted");
            String roomId = "room_" + consultationId;
            consultation.put("roomId", roomId);
            return roomId;
        }
        throw new RuntimeException("Consultation not found");
    }
    
    public void rejectConsultation(String consultationId, String reason) {
        Map<String, Object> consultation = consultations.get(consultationId);
        if (consultation != null) {
            consultation.put("status", "rejected");
            consultation.put("reason", reason);
        }
    }
}