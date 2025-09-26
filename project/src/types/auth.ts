export type UserRole = 'patient' | 'doctor' | 'pharmacy' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  specialization?: string; // for doctors
  location?: string; // for patients and pharmacies
  phone?: string;
  address?: string;
  licenseNumber?: string;
  pharmacyName?: string;
}

export interface AuthContext {
  user: User | null;
  login: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (userId: string, profileData: any) => Promise<{ success: boolean; message?: string }>;
  isAuthenticated: boolean;
}