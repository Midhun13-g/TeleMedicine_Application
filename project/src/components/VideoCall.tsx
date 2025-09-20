import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';

interface VideoCallProps {
  userId: string;
  targetUserId?: string;
  onCallEnd?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ userId, targetUserId, onCallEnd }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    localStream,
    remoteStream,
    isCallActive,
    isConnecting,
    initiateCall,
    acceptCall,
    endCall
  } = useWebRTC({
    userId,
    onIncomingCall: setIncomingCall
  });
  
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  
  const handleStartVideoCall = () => {
    if (targetUserId) {
      initiateCall(targetUserId, true);
    }
  };
  
  const handleStartAudioCall = () => {
    if (targetUserId) {
      initiateCall(targetUserId, false);
    }
  };
  
  const handleAcceptCall = () => {
    if (incomingCall) {
      acceptCall(incomingCall, true);
      setIncomingCall(null);
    }
  };
  
  const handleRejectCall = () => {
    setIncomingCall(null);
  };
  
  const handleEndCall = () => {
    endCall();
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
  
  if (incomingCall) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Incoming Call</h3>
          <p className="mb-6">Call from {incomingCall.callerId}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleAcceptCall} className="bg-green-500 hover:bg-green-600">
              <Phone className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button onClick={handleRejectCall} variant="destructive">
              <PhoneOff className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  if (!isCallActive && !isConnecting) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Start a Call</h3>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleStartVideoCall} className="bg-blue-500 hover:bg-blue-600">
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button onClick={handleStartAudioCall} className="bg-green-500 hover:bg-green-600">
              <Phone className="w-4 h-4 mr-2" />
              Audio Call
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </div>
        </div>
        
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            {targetUserId || 'Remote User'}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "default" : "destructive"}
          size="sm"
        >
          {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
        
        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "default" : "destructive"}
          size="sm"
        >
          {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        
        <Button onClick={handleEndCall} variant="destructive" size="sm">
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
      
      {isConnecting && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Connecting...</p>
        </div>
      )}
    </Card>
  );
};