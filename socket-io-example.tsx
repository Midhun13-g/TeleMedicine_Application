// ===========================================
// VideoCall Component with Socket.IO Comments
// ===========================================

import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ArrowLeft, User } from 'lucide-react';

// 🔗 Socket.IO Client Import
// Purpose: Real-time communication for WebRTC signaling
// What it does:
// - Establishes WebSocket connection to signaling server
// - Handles call initiation, acceptance, rejection
// - Exchanges ICE candidates and SDP offers/answers
// - Manages room-based communication for video calls
import io from 'socket.io-client';

interface VideoCallProps {
    userId: string;
    targetUserId?: string;
    roomId?: string;
    onCallEnd?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ userId, targetUserId, roomId, onCallEnd }) => {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // 🔌 Socket connection state
    // This holds the active socket.io connection to the signaling server
    const [socket, setSocket] = useState<any>(null);

    const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // 🚀 Initialize Socket Connection
    useEffect(() => {
        // Connect to the signaling server
        // The server should be running on port 5002 (or your backend port)
        const socketConnection = io('http://localhost:8080', {
            // Connection options
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            timeout: 5000, // Connection timeout
            forceNew: true, // Create new connection instead of reusing
            query: {
                userId: userId, // Send user ID for identification
                roomId: roomId || `call_${userId}_${targetUserId}` // Room identifier
            }
        });

        // 📡 Socket Event Listeners

        // Connection established successfully
        socketConnection.on('connect', () => {
            console.log('✅ Socket connected:', socketConnection.id);
            setSocket(socketConnection);

            // Join the call room
            if (roomId) {
                socketConnection.emit('join-room', { roomId, userId });
            }
        });

        // Connection lost
        socketConnection.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setCallStatus('ended');
        });

        // Error handling
        socketConnection.on('connect_error', (error) => {
            console.error('🚨 Socket connection error:', error);
        });

        // 📞 Call-related events

        // Incoming call notification
        socketConnection.on('incoming-call', (data) => {
            console.log('📞 Incoming call from:', data.callerId);
            // Handle incoming call UI/logic here
        });

        // Call accepted by remote user
        socketConnection.on('call-accepted', (data) => {
            console.log('✅ Call accepted by:', data.userId);
            setCallStatus('connected');
        });

        // Call rejected by remote user
        socketConnection.on('call-rejected', (data) => {
            console.log('❌ Call rejected by:', data.userId);
            setCallStatus('ended');
        });

        // Remote user ended the call
        socketConnection.on('call-ended', (data) => {
            console.log('📱 Call ended by:', data.userId);
            setCallStatus('ended');
            cleanup();
        });

        // 🌐 WebRTC Signaling Events

        // Received SDP offer from remote peer
        socketConnection.on('offer', async (data) => {
            console.log('📨 Received offer from:', data.userId);
            // Handle WebRTC offer logic here
        });

        // Received SDP answer from remote peer
        socketConnection.on('answer', async (data) => {
            console.log('📨 Received answer from:', data.userId);
            // Handle WebRTC answer logic here
        });

        // Received ICE candidate from remote peer
        socketConnection.on('ice-candidate', async (data) => {
            console.log('🧊 Received ICE candidate from:', data.userId);
            // Handle ICE candidate exchange logic here
        });

        // User joined the room
        socketConnection.on('user-joined', (data) => {
            console.log('👤 User joined room:', data.userId);
        });

        // User left the room
        socketConnection.on('user-left', (data) => {
            console.log('👋 User left room:', data.userId);
        });

        // Cleanup on component unmount
        return () => {
            console.log('🧹 Cleaning up socket connection');
            socketConnection.disconnect();
        };
    }, [userId, targetUserId, roomId]);

    // 📞 Function to initiate a call
    const initiateCall = () => {
        if (socket && targetUserId) {
            console.log('📞 Initiating call to:', targetUserId);

            // Emit call initiation event
            socket.emit('initiate-call', {
                callerId: userId,
                receiverId: targetUserId,
                roomId: roomId || `call_${userId}_${targetUserId}`,
                type: 'VIDEO' // or 'AUDIO'
            });
        }
    };

    // ✅ Function to accept incoming call
    const acceptCall = () => {
        if (socket) {
            console.log('✅ Accepting call');

            socket.emit('accept-call', {
                userId: userId,
                roomId: roomId
            });

            setCallStatus('connected');
        }
    };

    // ❌ Function to reject incoming call
    const rejectCall = () => {
        if (socket) {
            console.log('❌ Rejecting call');

            socket.emit('reject-call', {
                userId: userId,
                roomId: roomId
            });

            setCallStatus('ended');
        }
    };

    // 📱 Function to end the call
    const endCall = () => {
        if (socket) {
            console.log('📱 Ending call');

            // Notify other participants
            socket.emit('end-call', {
                userId: userId,
                roomId: roomId
            });
        }

        cleanup();
    };

    // 🧹 Cleanup function
    const cleanup = () => {
        console.log('🧹 Cleaning up call resources');

        // Stop local media streams
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log('🛑 Stopped track:', track.kind);
            });
            setLocalStream(null);
        }

        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
            console.log('🔌 Closed peer connection');
        }

        // Leave room and disconnect socket
        if (socket) {
            socket.emit('leave-room', { roomId, userId });
            socket.disconnect();
            setSocket(null);
            console.log('🚪 Left room and disconnected socket');
        }

        setCallStatus('ended');
        onCallEnd?.();
    };

    // Rest of your component JSX...
    return (
        <div className="video-call-container">
            {/* Your video call UI components */}
            <Card className="relative w-full h-screen bg-black">
                {/* Video elements, controls, etc. */}
                <Button onClick={endCall} variant="destructive">
                    <PhoneOff className="h-6 w-6" />
                </Button>
            </Card>
        </div>
    );
};