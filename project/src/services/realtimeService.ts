// Real-time synchronization service for cross-component communication
export class RealtimeService {
  private static instance: RealtimeService;
  
  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Notify when prescription is added
  notifyPrescriptionAdded(data: {
    prescriptionId: number;
    doctorName: string;
    patientId: string;
    medicines: string;
    notes?: string;
  }) {
    const event = new CustomEvent('prescriptionAdded', { detail: data });
    window.dispatchEvent(event);
    console.log('🔄 Prescription notification sent:', data);
  }

  // Notify when medicine is taken
  notifyMedicineTaken(data: {
    patientId: string;
    patientName: string;
    prescriptionId: number;
    medicines: string;
    takenAt: string;
  }) {
    const event = new CustomEvent('medicineTaken', { detail: data });
    window.dispatchEvent(event);
    console.log('🔄 Medicine taken notification sent:', data);
  }

  // Notify when inventory is updated
  notifyInventoryUpdate(data: {
    medicineId: number;
    medicineName: string;
    newStock: number;
    pharmacyId: number;
  }) {
    const event = new CustomEvent('inventoryUpdated', { detail: data });
    window.dispatchEvent(event);
    console.log('🔄 Inventory update notification sent:', data);
  }

  // Listen for prescription updates
  onPrescriptionAdded(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('prescriptionAdded', handler as EventListener);
    return () => window.removeEventListener('prescriptionAdded', handler as EventListener);
  }

  // Listen for medicine taken updates
  onMedicineTaken(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('medicineTaken', handler as EventListener);
    return () => window.removeEventListener('medicineTaken', handler as EventListener);
  }

  // Listen for inventory updates
  onInventoryUpdate(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('inventoryUpdated', handler as EventListener);
    return () => window.removeEventListener('inventoryUpdated', handler as EventListener);
  }
}

export const realtimeService = RealtimeService.getInstance();