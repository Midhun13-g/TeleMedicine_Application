import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Heart, Users, Building2, ArrowLeft, UserPlus } from 'lucide-react';
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
    pharmacyName: '',
    adminKey: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full floating-element"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-accent/5 rounded-full floating-element" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-success/5 rounded-full floating-element" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Card className="w-full max-w-2xl shadow-medical border-0 bg-card/90 backdrop-blur-sm relative z-10 animate-slide-up">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Activity className="h-10 w-10 text-primary animate-pulse" />
              <div className="absolute inset-0 h-10 w-10 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold gradient-text">TeleAsha</h1>
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">Create Account</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">Join our healthcare community and get started</CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="h-12 px-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-12 px-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="h-12 px-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="h-12 px-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
              />
            </div>
            
            <Select onValueChange={(value) => handleInputChange('role', value)} required>
              <SelectTrigger className="h-12 px-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50">
                <SelectValue placeholder="Select Your Role" />
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
                <SelectItem value="admin">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-destructive" />
                    <span>Administrator</span>
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
            
            {formData.role === 'admin' && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">Administrator Access</span>
                </div>
                <Input
                  type="password"
                  placeholder="Admin Secret Key"
                  value={formData.adminKey}
                  onChange={(e) => handleInputChange('adminKey', e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-destructive/80 mt-2">
                  Administrator accounts require a secret key. Contact system administrator for access.
                </p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">Already have an account?</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={onBackToLogin}
              className="w-full h-12 text-lg font-medium border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back to Login</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;