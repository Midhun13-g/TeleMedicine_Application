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
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create prescription');
      return response.json();
    } catch (error) {
      console.error('Error creating prescription:', error);
      return { success: false, message: 'Failed to create prescription' };
    }
  },

  async getPatientPrescriptions(patientId: number): Promise<Prescription[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      return response.json();
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
  }
};