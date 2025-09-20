package com.example.projectbackend.service;

import com.example.projectbackend.model.Call;
import com.example.projectbackend.repository.CallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CallService {
    
    @Autowired
    private CallRepository callRepository;
    
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
}