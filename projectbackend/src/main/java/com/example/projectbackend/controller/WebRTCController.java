package com.example.projectbackend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/webrtc")
@CrossOrigin(origins = "*")
public class WebRTCController {
    
    private final Map<String, Object> signalStore = new ConcurrentHashMap<>();
    private final Map<String, String> roomParticipants = new ConcurrentHashMap<>();
    
    @PostMapping("/signal")
    public ResponseEntity<String> handleSignal(@RequestBody Map<String, Object> signal) {
        String targetUserId = (String) signal.get("targetUserId");
        if (targetUserId != null) {
            signalStore.put(targetUserId, signal);
        }
        return ResponseEntity.ok("Signal sent");
    }
    
    @GetMapping("/signal/{userId}")
    public ResponseEntity<Object> getSignal(@PathVariable String userId) {
        Object signal = signalStore.remove(userId);
        return ResponseEntity.ok(signal != null ? signal : Map.of());
    }
    
    @PostMapping("/join-room")
    public ResponseEntity<Map<String, String>> joinRoom(@RequestBody Map<String, String> request) {
        String roomId = request.get("roomId");
        String userId = request.get("userId");
        String userType = request.get("userType");
        
        roomParticipants.put(userId, roomId);
        return ResponseEntity.ok(Map.of("status", "joined", "roomId", roomId, "userType", userType));
    }
    
    @PostMapping("/offer")
    public ResponseEntity<String> sendOffer(@RequestBody Map<String, Object> request) {
        String roomId = (String) request.get("roomId");
        Object offer = request.get("offer");
        signalStore.put(roomId + "_offer", offer);
        return ResponseEntity.ok("Offer sent");
    }
    
    @PostMapping("/answer")
    public ResponseEntity<String> sendAnswer(@RequestBody Map<String, Object> request) {
        String roomId = (String) request.get("roomId");
        Object answer = request.get("answer");
        signalStore.put(roomId + "_answer", answer);
        return ResponseEntity.ok("Answer sent");
    }
    
    @PostMapping("/ice-candidate")
    public ResponseEntity<String> sendIceCandidate(@RequestBody Map<String, Object> request) {
        String roomId = (String) request.get("roomId");
        Object candidate = request.get("candidate");
        String key = roomId + "_ice_" + System.currentTimeMillis();
        signalStore.put(key, candidate);
        return ResponseEntity.ok("ICE candidate sent");
    }
    
    @GetMapping("/room/{roomId}/signals")
    public ResponseEntity<Map<String, Object>> getRoomSignals(@PathVariable String roomId) {
        Map<String, Object> signals = new ConcurrentHashMap<>();
        
        Object offer = signalStore.remove(roomId + "_offer");
        if (offer != null) signals.put("offer", offer);
        
        Object answer = signalStore.remove(roomId + "_answer");
        if (answer != null) signals.put("answer", answer);
        
        return ResponseEntity.ok(signals);
    }
}