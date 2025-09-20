import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebRTCProps {
  userId: string;
  onIncomingCall?: (callData: any) => void;
}

export const useWebRTC = ({ userId, onIncomingCall }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  
  const pcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };
  
  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(pcConfig);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send via REST API
        fetch('http://localhost:8080/api/webrtc/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            targetUserId: userId
          })
        });
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    peerConnection.current = pc;
  }, [userId]);
  
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
      
      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      
      // Send offer via REST API
      await fetch('http://localhost:8080/api/webrtc/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'offer',
          description: offer,
          targetUserId
        })
      });
      
      setIsCallActive(true);
    } catch (error) {
      console.error('Error initiating call:', error);
      setIsConnecting(false);
    }
  }, [startLocalStream, initializePeerConnection]);
  
  const acceptCall = useCallback(async (offerData: any, video: boolean = true) => {
    setIsConnecting(true);
    
    try {
      await startLocalStream(video);
      initializePeerConnection();
      
      await peerConnection.current?.setRemoteDescription(offerData.description);
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      
      // Send answer via REST API
      await fetch('http://localhost:8080/api/webrtc/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'answer',
          description: answer,
          targetUserId: offerData.callerId
        })
      });
      
      setIsCallActive(true);
      setIsConnecting(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      setIsConnecting(false);
    }
  }, [startLocalStream, initializePeerConnection]);
  
  const endCall = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    peerConnection.current?.close();
    peerConnection.current = null;
    
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsConnecting(false);
  }, [localStream, remoteStream]);
  
  // Poll for incoming signals
  useEffect(() => {
    const pollSignals = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/webrtc/signal/${userId}`);
        const data = await response.json();
        
        if (data.type === 'offer') {
          onIncomingCall?.(data);
        } else if (data.type === 'answer' && peerConnection.current) {
          await peerConnection.current.setRemoteDescription(data.description);
        } else if (data.type === 'ice-candidate' && peerConnection.current) {
          await peerConnection.current.addIceCandidate(data.candidate);
        }
      } catch (error) {
        // Ignore polling errors
      }
    };
    
    const interval = setInterval(pollSignals, 2000);
    return () => clearInterval(interval);
  }, [userId, onIncomingCall]);
  
  return {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    initiateCall,
    acceptCall,
    endCall
  };
};