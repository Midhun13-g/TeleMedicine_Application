package com.example.projectbackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SignalingHandler implements WebSocketHandler {
    
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> userRooms = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
    }
    
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        try {
            Map<String, Object> data = objectMapper.readValue(message.getPayload().toString(), Map.class);
            String type = (String) data.get("type");
            
            switch (type) {
                case "join-room":
                    String roomId = (String) data.get("roomId");
                    userRooms.put(session.getId(), roomId);
                    broadcastToRoom(roomId, data, session.getId());
                    break;
                case "offer":
                case "answer":
                case "ice-candidate":
                    String room = userRooms.get(session.getId());
                    if (room != null) {
                        broadcastToRoom(room, data, session.getId());
                    }
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private void broadcastToRoom(String roomId, Map<String, Object> data, String senderId) {
        sessions.values().forEach(session -> {
            if (!session.getId().equals(senderId) && roomId.equals(userRooms.get(session.getId()))) {
                try {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(data)));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        sessions.remove(session.getId());
        userRooms.remove(session.getId());
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        sessions.remove(session.getId());
        userRooms.remove(session.getId());
    }
    
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}