/**
 * ===========================================
 * Socket.IO Client Import and Usage Guide
 * ===========================================
 * 
 * This file demonstrates how to properly import and use socket.io-client
 * for real-time communication in a React/TypeScript application.
 * 
 * Installation:
 * npm install socket.io-client@4.7.2
 * 
 * Documentation: https://socket.io/docs/v4/client-api/
 */

// ✅ BASIC IMPORT
// Import the default socket.io client function
// This is the most common way to import socket.io-client
import io from 'socket.io-client';

// ✅ ALTERNATIVE IMPORTS (if needed)
// If you need TypeScript types or specific methods:
// import { io, Socket } from 'socket.io-client';

// ✅ TYPE DEFINITIONS (for TypeScript)
// Optional: Define types for better type safety
interface SocketEvents {
    // Client to Server events
    'join-room': (data: { roomId: string; userId: string }) => void;
    'leave-room': (data: { roomId: string; userId: string }) => void;
    'initiate-call': (data: { callerId: string; receiverId: string; roomId: string; type: string }) => void;
    'accept-call': (data: { userId: string; roomId: string }) => void;
    'reject-call': (data: { userId: string; roomId: string }) => void;
    'end-call': (data: { userId: string; roomId: string }) => void;
    'offer': (data: { offer: RTCSessionDescriptionInit; userId: string }) => void;
    'answer': (data: { answer: RTCSessionDescriptionInit; userId: string }) => void;
    'ice-candidate': (data: { candidate: RTCIceCandidateInit; userId: string }) => void;
}

interface ServerEvents {
    // Server to Client events
    'connect': () => void;
    'disconnect': (reason: string) => void;
    'connect_error': (error: Error) => void;
    'incoming-call': (data: { callerId: string; roomId: string }) => void;
    'call-accepted': (data: { userId: string }) => void;
    'call-rejected': (data: { userId: string }) => void;
    'call-ended': (data: { userId: string }) => void;
    'user-joined': (data: { userId: string }) => void;
    'user-left': (data: { userId: string }) => void;
    'offer': (data: { offer: RTCSessionDescriptionInit; userId: string }) => void;
    'answer': (data: { answer: RTCSessionDescriptionInit; userId: string }) => void;
    'ice-candidate': (data: { candidate: RTCIceCandidateInit; userId: string }) => void;
}

// ✅ USAGE EXAMPLES

/**
 * 1. BASIC CONNECTION
 * Connect to your backend server running socket.io
 */
const connectToServer = (userId: string) => {
    // Connect to socket.io server
    // Replace 'http://localhost:8080' with your backend URL
    const socket = io('http://localhost:8080', {
        // Connection options
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        timeout: 5000, // Connection timeout in milliseconds
        forceNew: true, // Force new connection (don't reuse existing)
        autoConnect: true, // Auto-connect on creation
        reconnection: true, // Enable auto-reconnection
        reconnectionAttempts: 5, // Number of reconnection attempts
        reconnectionDelay: 1000, // Initial reconnection delay

        // Query parameters sent with connection
        query: {
            userId: userId, // Send user ID for server identification
            userType: 'patient' // Additional metadata
        },

        // Authentication (if your server requires it)
        auth: {
            token: 'your-auth-token' // JWT token or other auth data
        }
    });

    return socket;
};

/**
 * 2. EVENT LISTENERS
 * Handle events from the server
 */
const setupEventListeners = (socket: any) => {
    // ✅ Connection Events
    socket.on('connect', () => {
        console.log('✅ Connected to server with ID:', socket.id);
    });

    socket.on('disconnect', (reason: string) => {
        console.log('❌ Disconnected from server. Reason:', reason);
        // Handle reconnection logic if needed
    });

    socket.on('connect_error', (error: Error) => {
        console.error('🚨 Connection error:', error.message);
        // Handle connection errors (show user message, retry, etc.)
    });

    // ✅ Custom Events (your application logic)
    socket.on('incoming-call', (data: any) => {
        console.log('📞 Incoming call from:', data.callerId);
        // Show incoming call UI
        // Play ringtone
        // Update call state
    });

    socket.on('call-accepted', (data: any) => {
        console.log('✅ Call accepted by:', data.userId);
        // Start video call
        // Initialize WebRTC connection
    });

    socket.on('user-joined', (data: any) => {
        console.log('👤 User joined room:', data.userId);
        // Update UI to show new participant
    });

    // ✅ WebRTC Signaling Events
    socket.on('offer', (data: any) => {
        console.log('📨 Received WebRTC offer');
        // Handle SDP offer for video call
    });

    socket.on('answer', (data: any) => {
        console.log('📨 Received WebRTC answer');
        // Handle SDP answer for video call
    });

    socket.on('ice-candidate', (data: any) => {
        console.log('🧊 Received ICE candidate');
        // Handle ICE candidate for peer connection
    });
};

/**
 * 3. EMITTING EVENTS
 * Send events to the server
 */
const emitEvents = (socket: any, userId: string) => {
    // ✅ Join a room (for group calls or chat)
    socket.emit('join-room', {
        roomId: 'call-room-123',
        userId: userId
    });

    // ✅ Initiate a video call
    socket.emit('initiate-call', {
        callerId: userId,
        receiverId: 'target-user-id',
        roomId: 'call-room-123',
        type: 'VIDEO' // or 'AUDIO'
    });

    // ✅ Send WebRTC signaling data
    socket.emit('offer', {
        offer: {}, // SDP offer object
        userId: userId,
        targetUserId: 'target-user-id'
    });

    // ✅ Send ICE candidate
    socket.emit('ice-candidate', {
        candidate: {}, // ICE candidate object
        userId: userId,
        targetUserId: 'target-user-id'
    });

    // ✅ End call
    socket.emit('end-call', {
        userId: userId,
        roomId: 'call-room-123'
    });
};

/**
 * 4. CLEANUP
 * Always clean up socket connections when component unmounts
 */
const cleanupSocket = (socket: any) => {
    if (socket) {
        // Remove all event listeners
        socket.removeAllListeners();

        // Disconnect from server
        socket.disconnect();

        console.log('🧹 Socket cleanup complete');
    }
};

/**
 * 5. REACT HOOK EXAMPLE
 * How to use socket.io-client in a React component
 */
/*
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (userId: string) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:8080', {
      query: { userId }
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket');
      newSocket.disconnect();
    };
  }, [userId]);

  return { socket, isConnected };
};
*/

/**
 * 6. ERROR HANDLING
 * Common issues and solutions
 */

// ❌ Common Error: Cannot load driver class
// Solution: Make sure socket.io-client is installed:
// npm install socket.io-client@4.7.2

// ❌ Common Error: CORS issues
// Solution: Configure CORS on your backend server

// ❌ Common Error: Connection timeout
// Solution: Check if backend server is running and accessible

// ❌ Common Error: Event not received
// Solution: Verify event names match exactly on client and server

/**
 * 7. BACKEND SETUP (for reference)
 * Your Spring Boot backend should have socket.io server configured
 */

// Java backend configuration example:
/*
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SignalingHandler(), "/socket.io")
                .setAllowedOrigins("*");
    }
}
*/

export {
    connectToServer,
    setupEventListeners,
    emitEvents,
    cleanupSocket
};