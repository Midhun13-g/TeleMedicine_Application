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
}