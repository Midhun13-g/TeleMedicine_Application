const API_BASE_URL = 'http://localhost:8080/api/pharmacies';

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  contact: string;
  distance: string;
  rating: number;
  openHours: string;
  is24Hours: boolean;
}

export const pharmacyService = {
  async getNearbyPharmacies(lat?: number, lng?: number): Promise<Pharmacy[]> {
    try {
      let url = `${API_BASE_URL}/nearby`;
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch nearby pharmacies');
      return response.json();
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      return [];
    }
  },

  async searchPharmacies(query: string): Promise<Pharmacy[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search pharmacies');
      return response.json();
    } catch (error) {
      console.error('Error searching pharmacies:', error);
      return [];
    }
  }
};