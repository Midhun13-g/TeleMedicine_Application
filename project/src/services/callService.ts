const API_BASE_URL = 'http://localhost:8080/api/calls';

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
};