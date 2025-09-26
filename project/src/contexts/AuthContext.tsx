import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContext as IAuthContext } from '@/types/auth';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<{success: boolean, message?: string}> => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('📡 Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed:', response.status, errorText);
        return {success: false, message: 'Login failed'};
      }
      
      const data = await response.json();
      console.log('✅ Login response data:', data);
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('🎉 Login successful for user:', data.user.name, 'Role:', data.user.role);
        return {success: true};
      }
      console.log('❌ Login failed:', data.message);
      return {success: false, message: data.message};
    } catch (error) {
      console.error('💥 Login error:', error);
      return {success: false, message: 'Network error. Please check if the backend server is running.'};
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📡 Registration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Registration failed:', response.status, errorText);
        return { success: false, message: `Registration failed: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('✅ Registration response:', data);
      
      if (data.success) {
        console.log('🎉 Registration successful for:', userData.email);
      }
      
      return data;
    } catch (error) {
      console.error('💥 Registration error:', error);
      return { success: false, message: 'Network error. Please check if the backend server is running on port 8080.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (userId: string, profileData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        return { success: false, message: 'Profile update failed' };
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Network error during profile update' };
    }
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;

    const checkSuspension = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/check-status/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.suspended) {
            alert('🚫 Your account has been suspended by an administrator. You will be logged out now.');
            logout();
          }
        }
      } catch (error) {
        console.error('Failed to check suspension status:', error);
      }
    };

    const interval = setInterval(checkSuspension, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};