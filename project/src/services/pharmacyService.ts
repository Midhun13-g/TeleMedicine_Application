const API_BASE_URL = 'http://localhost:8080/api';



export interface MedicineStock {
  id: number;
  name: string;
  manufacturer: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  minStockLevel: number;
  expiryDate: string;
  batchNumber: string;
  pharmacyId: number;
  available: boolean;
  dosage: string;
  sideEffects: string;
}

export const pharmacyService = {

  // Medicine stock management
  async getPharmacyMedicines(pharmacyId: number): Promise<MedicineStock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/pharmacy/${pharmacyId}`);
      if (!response.ok) throw new Error('Failed to fetch pharmacy medicines');
      return response.json();
    } catch (error) {
      console.error('Error fetching pharmacy medicines:', error);
      return [];
    }
  },

  async addMedicine(medicine: Partial<MedicineStock>): Promise<{ success: boolean; medicine?: MedicineStock; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      return response.json();
    } catch (error) {
      console.error('Error adding medicine:', error);
      return { success: false, message: 'Failed to add medicine' };
    }
  },

  async updateMedicine(id: number, medicine: Partial<MedicineStock>): Promise<{ success: boolean; medicine?: MedicineStock; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicine)
      });
      return response.json();
    } catch (error) {
      console.error('Error updating medicine:', error);
      return { success: false, message: 'Failed to update medicine' };
    }
  },

  async updateStock(id: number, stock: number): Promise<{ success: boolean; medicine?: MedicineStock; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/update-stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
      return response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, message: 'Failed to update stock' };
    }
  },

  async deleteMedicine(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/delete/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return { success: false, message: 'Failed to delete medicine' };
    }
  },

  async getLowStockMedicines(pharmacyId: number): Promise<MedicineStock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines/low-stock/${pharmacyId}`);
      if (!response.ok) throw new Error('Failed to fetch low stock medicines');
      return response.json();
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      return [];
    }
  },

  async searchMedicines(query?: string): Promise<MedicineStock[]> {
    try {
      let url = `${API_BASE_URL}/medicines/search`;
      if (query) {
        url += `?q=${encodeURIComponent(query)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to search medicines');
      return response.json();
    } catch (error) {
      console.error('Error searching medicines:', error);
      return [];
    }
  }
};