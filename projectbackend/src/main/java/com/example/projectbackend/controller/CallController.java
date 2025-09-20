package com.example.projectbackend.controller;

import com.example.projectbackend.model.Call;
import com.example.projectbackend.service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
@CrossOrigin(origins = "*")
public class CallController {
    
    @Autowired
    private CallService callService;
    
    @PostMapping("/initiate")
    public ResponseEntity<Call> initiateCall(@RequestBody Map<String, Object> request) {
        String callerId = (String) request.get("callerId");
        String receiverId = (String) request.get("receiverId");
        Call.CallType type = Call.CallType.valueOf((String) request.get("type"));
        
        Call call = callService.initiateCall(callerId, receiverId, type);
        return ResponseEntity.ok(call);
    }
    
    @PutMapping("/{callId}/accept")
    public ResponseEntity<Call> acceptCall(@PathVariable Long callId) {
        Call call = callService.acceptCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @PutMapping("/{callId}/reject")
    public ResponseEntity<Call> rejectCall(@PathVariable Long callId) {
        Call call = callService.rejectCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @PutMapping("/{callId}/end")
    public ResponseEntity<Call> endCall(@PathVariable Long callId) {
        Call call = callService.endCall(callId);
        return ResponseEntity.ok(call);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Call>> getUserCalls(@PathVariable String userId) {
        List<Call> calls = callService.getUserCalls(userId);
        return ResponseEntity.ok(calls);
    }
    
    @GetMapping("/incoming/{userId}")
    public ResponseEntity<List<Call>> getIncomingCalls(@PathVariable String userId) {
        List<Call> calls = callService.getIncomingCalls(userId);
        return ResponseEntity.ok(calls);
    }
}