interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
}

interface AppointmentData {
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  symptoms: string;
}

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
}

class AppointmentService {
  private baseUrl = 'http://localhost:8080/api/appointments';

  async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${this.baseUrl}/doctors`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  async bookAppointment(appointmentData: AppointmentData): Promise<{ success: boolean; message?: string; appointmentId?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return { success: false, message: 'Failed to book appointment' };
    }
  }

  async getPatientAppointments(patientId: number): Promise<Appointment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/patient/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getAvailableSlots(doctorId: number, date: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/available-slots/${doctorId}?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch slots');
      return await response.json();
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  }
}

export const appointmentService = new AppointmentService();
export type { Doctor, AppointmentData, Appointment };