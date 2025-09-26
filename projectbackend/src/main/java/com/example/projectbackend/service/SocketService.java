package com.example.projectbackend.service;

import org.springframework.stereotype.Service;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@Service
public class SocketService {
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String SOCKET_SERVER_URL = "http://localhost:5002";
    
    public SocketService() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public void emitReportStatusUpdate(Long reportId, String reporterId, String status) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("reportId", reportId);
            data.put("reporterId", reporterId);
            data.put("status", status);
            
            String jsonData = objectMapper.writeValueAsString(data);
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SOCKET_SERVER_URL + "/api/emit/report-status-update"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonData))
                .timeout(Duration.ofMillis(500))
                .build();
            
            // Send synchronously for immediate delivery
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
        } catch (Exception e) {
            // Ignore errors to prevent blocking
        }
    }
}