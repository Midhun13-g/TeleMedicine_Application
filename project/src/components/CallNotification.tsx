import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { toast } from './ui/use-toast';

interface CallNotificationProps {
  userId: string;
}

interface IncomingCall {
  id: number;
  callerId: string;
  type: 'AUDIO' | 'VIDEO';
  sessionId: string;
}

export const CallNotification: React.FC<CallNotificationProps> = ({ userId }) => {
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  
  useEffect(() => {
    const checkIncomingCalls = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/calls/incoming/${userId}`);
        const calls = await response.json();
        
        calls.forEach((call: any) => {
          if (!incomingCalls.find(c => c.id === call.id)) {
            setIncomingCalls(prev => [...prev, {
              id: call.id,
              callerId: call.callerId,
              type: call.type,
              sessionId: call.sessionId
            }]);
            
            // Show browser notification
            if (Notification.permission === 'granted') {
              new Notification(`Incoming ${call.type.toLowerCase()} call`, {
                body: `Call from ${call.callerId}`,
                icon: '/favicon.ico'
              });
            }
            
            // Show toast notification
            toast({
              title: `Incoming ${call.type.toLowerCase()} call`,
              description: `Call from ${call.callerId}`,
              duration: 10000,
            });
          }
        });
      } catch (error) {
        console.error('Error checking incoming calls:', error);
      }
    };
    
    // Check for incoming calls every 2 seconds
    const interval = setInterval(checkIncomingCalls, 2000);
    
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(interval);
  }, [userId, incomingCalls]);
  
  const handleAcceptCall = async (call: IncomingCall) => {
    try {
      await fetch(`http://localhost:8080/api/calls/${call.id}/accept`, {
        method: 'PUT'
      });
      
      setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
      
      // Navigate to video call component or open call interface
      window.location.href = `/call/${call.sessionId}`;
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };
  
  const handleRejectCall = async (call: IncomingCall) => {
    try {
      await fetch(`http://localhost:8080/api/calls/${call.id}/reject`, {
        method: 'PUT'
      });
      
      setIncomingCalls(prev => prev.filter(c => c.id !== call.id));
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };
  
  if (incomingCalls.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {incomingCalls.map((call) => (
        <Card key={call.id} className="p-4 bg-white shadow-lg border-l-4 border-l-blue-500 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {call.type === 'VIDEO' ? (
                <Video className="w-6 h-6 text-blue-500" />
              ) : (
                <Phone className="w-6 h-6 text-green-500" />
              )}
              <div>
                <p className="font-semibold">Incoming {call.type.toLowerCase()} call</p>
                <p className="text-sm text-gray-600">From: {call.callerId}</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAcceptCall(call)}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleRejectCall(call)}
                size="sm"
                variant="destructive"
              >
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};