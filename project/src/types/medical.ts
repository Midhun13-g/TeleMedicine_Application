export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  symptoms?: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicines: Medicine[];
  notes: string;
  date: string;
  status: 'active' | 'completed';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicineStock {
  id: number;
  pharmacyId: number;
  name: string;
  stock: number;
  price: number;
  manufacturer: string;
  expiryDate: string;
  category: string;
  description: string;
  dosage: string;
  sideEffects: string;
  available: boolean;
  minStockLevel: number;
  batchNumber: string;
}

export interface SymptomCheck {
  fever: boolean;
  cough: boolean;
  headache: boolean;
  bodyPain: boolean;
  nausea: boolean;
  fatigue: boolean;
  other: string;
}

export interface AnalyticsData {
  totalConsultations: number;
  weeklyConsultations: Array<{ day: string; count: number }>;
  topMedicines: Array<{ name: string; requests: number }>;
  fulfillmentRate: number;
  activePatients: number;
  activeDoctors: number;
  totalPharmacies: number;
}