import { useState, useRef, useCallback, useEffect } from 'react';
import { callService } from '../services/callService';

interface UseWebRTCProps {
  userId: string;
  roomId?: string;
  onIncomingCall?: (callData: any) => void;
}

export const useWebRTC = ({ userId, roomId, onIncomingCall }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const pcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
  
  const initializeWebSocket = useCallback(() => {
    if (roomId) {
      wsRef.current = new WebSocket('ws://localhost:8080/ws/signaling');
      
      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({
          type: 'join-room',
          roomId,
          userType: 'user'
        }));
      };
      
      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'offer':
            await handleRemoteOffer(data.offer);
            break;
          case 'answer':
            await handleAnswer(data.answer);
            break;
          case 'ice-candidate':
            await handleIceCandidate(data.candidate);
            break;
        }
      };
    }
  }, [roomId]);
  
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pcConfig);
    
    pc.onicecandidate = async (event) => {
      if (event.candidate && roomId) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate
          }));
        } else {
          await callService.sendIceCandidate(roomId, event.candidate);
        }
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setIsConnected(state === 'connected');
      if (state === 'disconnected' || state === 'failed') {
        endCall();
      }
    };
    
    peerConnection.current = pc;
  }, [roomId]);
  
  const startLocalStream = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true
      });
      setLocalStream(stream);
      
      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current?.addTrack(track, stream);
        });
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);
  
  const initiateCall = useCallback(async (targetUserId: string, video: boolean = true) => {
    setIsConnecting(true);
    
    try {
      await startLocalStream(video);
      initializePeerConnection();
      initializeWebSocket();
      
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      
      if (roomId && offer) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            offer
          }));
        } else {
          await callService.sendOffer(roomId, offer);
        }
      }
      
      setIsCallActive(true);
    } catch (error) {
      console.error('Error initiating call:', error);
      setIsConnecting(false);
    }
  }, [startLocalStream, initializePeerConnection, initializeWebSocket, roomId]);
  
  const handleRemoteOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      await startLocalStream(true);
      initializePeerConnection();
      
      await peerConnection.current?.setRemoteDescription(offer);
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      
      if (roomId && answer) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'answer',
            answer
          }));
        } else {
          await callService.sendAnswer(roomId, answer);
        }
      }
      
      setIsCallActive(true);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error handling remote offer:', error);
      setIsConnecting(false);
    }
  }, [startLocalStream, initializePeerConnection, roomId]);
  
  const acceptCall = useCallback(async (offerData: any, video: boolean = true) => {
    await handleRemoteOffer(offerData.description || offerData.offer);
  }, [handleRemoteOffer]);
  
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      await peerConnection.current?.setRemoteDescription(answer);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);
  
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      await peerConnection.current?.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);
  
  const endCall = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    
    peerConnection.current?.close();
    peerConnection.current = null;
    
    wsRef.current?.close();
    wsRef.current = null;
    
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsConnecting(false);
    setIsConnected(false);
  }, [localStream]);
  
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);
  
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, [localStream]);
  
  // Poll for incoming signals when WebSocket is not available
  useEffect(() => {
    if (!roomId) {
      const pollSignals = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/webrtc/signal/${userId}`);
          const data = await response.json();
          
          if (data.type === 'offer') {
            onIncomingCall?.(data);
          } else if (data.type === 'answer' && peerConnection.current) {
            await handleAnswer(data.description);
          } else if (data.type === 'ice-candidate' && peerConnection.current) {
            await handleIceCandidate(data.candidate);
          }
        } catch (error) {
          // Ignore polling errors
        }
      };
      
      const interval = setInterval(pollSignals, 2000);
      return () => clearInterval(interval);
    }
  }, [userId, roomId, onIncomingCall, handleAnswer, handleIceCandidate]);
  
  return {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    isConnected,
    initiateCall,
    acceptCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
};