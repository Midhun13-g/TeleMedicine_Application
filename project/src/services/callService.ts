const API_BASE_URL = 'http://localhost:5002/api/calls';
const WEBRTC_API_URL = 'http://localhost:5002/api/webrtc';

export interface Call {
  id: number;
  callerId: string;
  receiverId: string;
  type: 'AUDIO' | 'VIDEO';
  status: 'INITIATED' | 'RINGING' | 'ACCEPTED' | 'REJECTED' | 'ENDED' | 'MISSED';
  startTime: string;
  endTime?: string;
  sessionId: string;
}

export interface Consultation {
  consultationId: string;
  patientId: string;
  doctorId: string;
  status: 'requested' | 'accepted' | 'rejected';
  roomId?: string;
  reason?: string;
}

export const callService = {
  async initiateCall(callerId: string, receiverId: string, type: 'AUDIO' | 'VIDEO'): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callerId, receiverId, type }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to initiate call');
    }
    
    return response.json();
  },
  
  async acceptCall(callId: number): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/${callId}/accept`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept call');
    }
    
    return response.json();
  },
  
  async rejectCall(callId: number): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/${callId}/reject`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject call');
    }
    
    return response.json();
  },
  
  async endCall(callId: number): Promise<Call> {
    const response = await fetch(`${API_BASE_URL}/${callId}/end`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to end call');
    }
    
    return response.json();
  },
  
  async getUserCalls(userId: string): Promise<Call[]> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user calls');
    }
    
    return response.json();
  },
  
  async getIncomingCalls(userId: string): Promise<Call[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/incoming/${userId}`);
      
      if (!response.ok) {
        return [];
      }
      
      return response.json();
    } catch (error) {
      return [];
    }
  },

  async setDoctorOnline(doctorId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/doctor/online`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorId }),
    });
  },

  async setDoctorOffline(doctorId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/doctor/offline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doctorId }),
    });
  },

  async getAvailableDoctors(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/doctors/available`);
    return response.ok ? response.json() : [];
  },

  async requestConsultation(patientId: string, doctorId: string): Promise<Consultation> {
    const response = await fetch(`${API_BASE_URL}/consultation/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, doctorId }),
    });
    return response.json();
  },

  async acceptConsultation(consultationId: string): Promise<Consultation> {
    const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/accept`, {
      method: 'POST',
    });
    return response.json();
  },

  async rejectConsultation(consultationId: string, reason?: string): Promise<Consultation> {
    const response = await fetch(`${API_BASE_URL}/consultation/${consultationId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: reason || 'Doctor unavailable' }),
    });
    return response.json();
  },

  async joinRoom(roomId: string, userId: string, userType: string): Promise<any> {
    const response = await fetch(`${WEBRTC_API_URL}/join-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, userId, userType }),
    });
    return response.json();
  },

  async sendOffer(roomId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    await fetch(`${WEBRTC_API_URL}/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, offer }),
    });
  },

  async sendAnswer(roomId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    await fetch(`${WEBRTC_API_URL}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, answer }),
    });
  },

  async sendIceCandidate(roomId: string, candidate: RTCIceCandidate): Promise<void> {
    await fetch(`${WEBRTC_API_URL}/ice-candidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, candidate }),
    });
  },

  async getRoomSignals(roomId: string): Promise<any> {
    const response = await fetch(`${WEBRTC_API_URL}/room/${roomId}/signals`);
    return response.json();
  },
};