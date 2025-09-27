import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ArrowLeft, User } from 'lucide-react';
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
  const [socket, setSocket] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Cleanup function
  const cleanup = () => {
    console.log('🧹 Cleaning up call resources');
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
      console.log('🔌 Closed peer connection');
    }
    
    if (socket) {
      if (roomId) {
        socket.emit('leave-room', { roomId });
      }
      socket.disconnect();
      setSocket(null);
      console.log('📡 Disconnected Socket.io');
    }
    
    const audioElements = document.querySelectorAll('audio[style*="display: none"]');
    audioElements.forEach(el => el.remove());
  };

  // Initialize media and WebRTC
  useEffect(() => {
    let mounted = true;
    
    const initializeCall = async () => {
      try {
        const constraints = {
          video: roomId && roomId.includes('audio') ? false : true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) return;
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        if (!mounted) return;
        
        setPeerConnection(pc);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        
        pc.ontrack = (event) => {
          if (!mounted) return;
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
          
          if (roomId && roomId.includes('audio')) {
            const audioElement = document.createElement('audio');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
          } else if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setCallStatus('connected');
        };
        
        const socketConnection = io('http://localhost:5002');
        if (!mounted) return;
        
        setSocket(socketConnection);
        
        socketConnection.on('connect', () => {
          if (roomId && mounted) {
            socketConnection.emit('join-room', { roomId, userType: userId });
            console.log('🎥 Joined call room:', roomId);
          }
        });
        
        socketConnection.on('offer', async ({ offer }) => {
          if (!mounted) return;
          try {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketConnection.emit('answer', { roomId, answer });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        });
        
        socketConnection.on('answer', async ({ answer }) => {
          if (!mounted) return;
          try {
            await pc.setRemoteDescription(answer);
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        });
        
        socketConnection.on('ice-candidate', async ({ candidate }) => {
          if (!mounted) return;
          try {
            await pc.addIceCandidate(candidate);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        });
        
        socketConnection.on('user-joined', async () => {
          if (!mounted) return;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketConnection.emit('offer', { roomId, offer });
          } catch (error) {
            console.error('Error creating offer:', error);
          }
        });
        
        pc.onicecandidate = (event) => {
          if (event.candidate && mounted) {
            socketConnection.emit('ice-candidate', { roomId, candidate: event.candidate });
          }
        };
        
        socketConnection.on('call-ended', () => {
          if (mounted) {
            setCallStatus('ended');
            onCallEnd?.();
          }
        });
        
        socketConnection.on('user-left', () => {
          if (mounted) {
            setCallStatus('ended');
            onCallEnd?.();
          }
        });
        
      } catch (error) {
        console.error('Error initializing call:', error);
        if (mounted) {
          setCallStatus('ended');
        }
      }
    };
    
    initializeCall();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, [roomId, userId]);
  
  const handleEndCall = () => {
    console.log('📞 Ending call manually');
    
    if (socket && roomId) {
      socket.emit('end-call', { roomId });
    }
    
    cleanup();
    setCallStatus('ended');
    onCallEnd?.();
  };
  
  const handleBackToDashboard = () => {
    cleanup();
    onCallEnd?.();
  };
  
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };
  
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 bg-gray-800">
        <Button 
          onClick={handleBackToDashboard}
          variant="ghost"
          className="text-white hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-xl font-semibold">Video Call</h1>
        <div className="text-sm text-gray-300">
          Status: {callStatus === 'connecting' ? 'Connecting...' : callStatus === 'connected' ? 'Connected' : 'Call Ended'}
        </div>
      </div>
      
      <Card className="p-4 max-w-6xl mx-auto mt-4 bg-gray-800 border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            {roomId && roomId.includes('audio') ? (
              <div className="w-full h-80 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-10 h-10" />
                  </div>
                  <p>Audio Call Active</p>
                </div>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-80 bg-gray-900 rounded-lg object-cover"
              />
            )}
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-70 px-3 py-1 rounded">
              You (Local)
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="relative">
            {roomId && roomId.includes('audio') ? (
              <div className="w-full h-80 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10" />
                  </div>
                  <p>Remote Audio</p>
                  {!remoteStream && <p className="text-sm mt-2">Connecting...</p>}
                </div>
              </div>
            ) : (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-80 bg-gray-900 rounded-lg object-cover"
              />
            )}
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-70 px-3 py-1 rounded">
              {targetUserId || 'Remote User'}
            </div>
            {!remoteStream && (
              <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Waiting for remote participant...</p>
                  <p className="text-xs text-gray-500 mt-2">WebRTC connection in progress...</p>
                </div>
              </div>
            )}
          </div>
      </div>
      
        <div className="flex justify-center gap-6 mt-6">
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          
          <Button 
            onClick={handleEndCall} 
            variant="destructive" 
            size="lg"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </Card>
    </div>

  );
};