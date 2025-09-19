import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Heart, Users, Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignUpPageProps {
  onBackToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onBackToLogin }) => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: '',
    specialization: '',
    licenseNumber: '',
    pharmacyName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully!"
        });
        onBackToLogin();
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return Heart;
      case 'doctor': return Users;
      case 'pharmacy': return Building2;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medical">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">TeleAsha</h1>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join our healthcare community</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>
            
            <Select onValueChange={(value) => handleInputChange('role', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-success" />
                    <span>Patient</span>
                  </div>
                </SelectItem>
                <SelectItem value="doctor">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Doctor</span>
                  </div>
                </SelectItem>
                <SelectItem value="pharmacy">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-warning" />
                    <span>Pharmacy</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            
            {formData.role === 'doctor' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                />
                <Input
                  placeholder="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                />
              </div>
            )}
            
            {formData.role === 'pharmacy' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Pharmacy Name"
                  value={formData.pharmacyName}
                  onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
                />
                <Input
                  placeholder="License Number"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              variant="medical" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={onBackToLogin}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;