import api from './api';

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
  appointmentTime: string;
  consultationType?: string;
  reasonForVisit?: string;
  symptoms?: string;
}

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  status: string;
  symptoms: string;
  timeSlot?: string;
  consultationType?: string;
  reasonForVisit?: string;
}

const appointmentService = {
  // Get available doctors
  getDoctors: async (specialization?: string): Promise<Doctor[]> => {
    try {
      const url = specialization
        ? `/appointments/doctors?specialization=${specialization}`
        : '/appointments/doctors';
      console.log('Fetching doctors from:', url);
      const response = await api.get(url);
      console.log('Doctors response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  // Get available time slots for a doctor on a specific date
  getAvailableSlots: async (doctorId: number, date: string): Promise<string[]> => {
    try {
      const response = await api.get(`/appointments/available-slots/${doctorId}?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  },

  // Book a new appointment
  bookAppointment: async (appointmentData: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    symptoms: string;
  }) => {
    try {
      console.log('Booking appointment with data:', appointmentData);
      
      const payload = {
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        symptoms: appointmentData.symptoms
      };

      console.log('Sending payload:', payload);
      const response = await api.post('/appointments/book', payload);
      console.log('Booking response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  // Get patient's appointments
  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  },

  // Get patient dashboard stats
  getPatientDashboardStats: async (patientId: string) => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        upcoming: 0,
        completed: 0,
        pending: 0,
        recentActivities: []
      };
    }
  },

  // Get upcoming appointments for patient
  getUpcomingAppointments: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}/upcoming`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  },

  // Get appointment history for patient
  getAppointmentHistory: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/patient/${patientId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      return [];
    }
  },

  // Get available doctors (alias for getDoctors)
  getAvailableDoctors: async (specialization?: string): Promise<Doctor[]> => {
    return appointmentService.getDoctors(specialization);
  },

  // Get available time slots (alias for getAvailableSlots)
  getAvailableTimeSlots: async (doctorId: string, date: string): Promise<string[]> => {
    return appointmentService.getAvailableSlots(parseInt(doctorId), date);
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/reschedule`, {
        newDate,
        newTime
      });
      return response.data;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string) => {
    try {
      const response = await api.delete(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  // Get doctor's appointments
  getDoctorAppointments: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
  },

  // Book instant appointment (next available slot)
  bookInstantAppointment: async (patientId: number, symptoms: string) => {
    try {
      const doctors = await appointmentService.getDoctors();
      const today = new Date().toISOString().split('T')[0];
      
      for (const doctor of doctors) {
        const slots = await appointmentService.getAvailableSlots(doctor.id, today);
        if (slots.length > 0) {
          const nextSlot = slots[0];
          const appointmentDateTime = `${today}T${nextSlot}:00`;
          
          return await appointmentService.bookAppointment({
            patientId,
            doctorId: doctor.id,
            appointmentDate: appointmentDateTime,
            symptoms
          });
        }
      }
      throw new Error('No available slots today');
    } catch (error) {
      console.error('Error booking instant appointment:', error);
      throw error;
    }
  },

  // Search appointments by criteria
  searchAppointments: async (patientId: string, criteria: {
    status?: string;
    doctorName?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    try {
      const appointments = await appointmentService.getPatientAppointments(patientId);
      return appointments.filter(appointment => {
        if (criteria.status && appointment.status !== criteria.status) return false;
        if (criteria.doctorName && !appointment.doctorName.toLowerCase().includes(criteria.doctorName.toLowerCase())) return false;
        if (criteria.dateFrom && appointment.appointmentDate < criteria.dateFrom) return false;
        if (criteria.dateTo && appointment.appointmentDate > criteria.dateTo) return false;
        return true;
      });
    } catch (error) {
      console.error('Error searching appointments:', error);
      return [];
    }
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment | null> => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  },

  // Check if appointment can be joined (for video calls)
  canJoinAppointment: (appointment: Appointment): boolean => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff <= 15 && minutesDiff >= -30 && 
           ['confirmed', 'approved'].includes(appointment.status.toLowerCase());
  },

  // Get next appointment for patient
  getNextAppointment: async (patientId: string): Promise<Appointment | null> => {
    try {
      const upcoming = await appointmentService.getUpcomingAppointments(patientId);
      return upcoming.length > 0 ? upcoming[0] : null;
    } catch (error) {
      console.error('Error fetching next appointment:', error);
      return null;
    }
  },

  // Get appointment statistics
  getAppointmentStats: async (patientId: string) => {
    try {
      const stats = await appointmentService.getPatientDashboardStats(patientId);
      const appointments = await appointmentService.getPatientAppointments(patientId);
      
      return {
        ...stats,
        total: appointments.length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        rescheduled: appointments.filter(a => a.status === 'rescheduled').length
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      return {
        upcoming: 0,
        completed: 0,
        pending: 0,
        total: 0,
        cancelled: 0,
        rescheduled: 0,
        recentActivities: []
      };
    }
  }
};

export { appointmentService };
export type { Doctor, AppointmentData, Appointment };