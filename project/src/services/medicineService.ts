const API_BASE_URL = 'http://localhost:8080/api/medicines';

export interface Medicine {
  id: number;
  name: string;
  manufacturer: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
  dosage: string;
  sideEffects: string;
}

export interface PharmacyInfo {
  name: string;
  distance: string;
  contact: string;
}

export const medicineService = {
  async searchMedicines(query: string): Promise<Medicine[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search medicines');
      return response.json();
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  },

  async getPopularMedicines(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/popular`);
      if (!response.ok) throw new Error('Failed to fetch popular medicines');
      return response.json();
    } catch (error) {
      console.error('Error fetching popular medicines:', error);
      return [];
    }
  },

  async checkAvailability(medicineName: string): Promise<{
    medicine: string;
    available: boolean;
    nearbyPharmacies: PharmacyInfo[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/availability/${encodeURIComponent(medicineName)}`);
      if (!response.ok) throw new Error('Failed to check availability');
      return response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      return {
        medicine: medicineName,
        available: false,
        nearbyPharmacies: []
      };
    }
  }
};