const API_BASE_URL = 'http://localhost:8080/api/prescriptions';

export interface Prescription {
  id: number;
  doctorName: string;
  medicines: string;
  notes: string;
  status: string;
  date: string;
}

export const prescriptionService = {
  async createPrescription(data: {
    patientId: number;
    doctorId: number;
    medicines: string;
    notes: string;
  }): Promise<{ success: boolean; prescriptionId?: number; message?: string }> {
    try {
      console.log('📤 Sending prescription request:', data);
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      console.log('📥 Response status:', response.status);
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error creating prescription:', error);
      return { success: false, message: error.message || 'Failed to create prescription' };
    }
  },

  async getPatientPrescriptions(patientId: number): Promise<Prescription[]> {
    try {
      console.log('📤 Fetching prescriptions for patient:', patientId);
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}`);
      
      if (!response.ok) {
        console.error('❌ Failed to fetch prescriptions:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('📥 Prescriptions fetched:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error);
      return [];
    }
  }
};