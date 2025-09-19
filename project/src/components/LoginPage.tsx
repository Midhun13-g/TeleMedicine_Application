import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Users, Building2, Shield, MapPin, Phone, Stethoscope, Pill, Video, Clock, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeSelector from '@/components/ThemeSelector';
import SignUpPage from '@/components/SignUpPage';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const roleButtons = [
    { role: 'patient', icon: Heart, color: 'text-success' },
    { role: 'doctor', icon: Users, color: 'text-primary' },
    { role: 'pharmacy', icon: Building2, color: 'text-warning' },
    { role: 'admin', icon: Shield, color: 'text-emergency' },
  ];

  const [selectedRole, setSelectedRole] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select a role to login.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        toast({
          title: t('login') + " Successful",
          description: t('welcome') + " to TeleAsha!",
        });
      } else {
        toast({
          title: t('login') + " Failed",
          description: "Invalid credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // quickLogin removed; login is now only via form with role selection

  if (showSignUp) {
    return <SignUpPage onBackToLogin={() => setShowSignUp(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">TeleAsha</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <LanguageSelector />
              <ThemeSelector />
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{t('emergency')}: 108</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Gujarat, India</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground leading-tight">
                Connecting Rural Communities to
                <span className="text-primary"> Quality Healthcare</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Bridge the healthcare gap with our telemedicine platform. Get consultations,
                prescriptions, and medicine availability checks from the comfort of your village.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center space-x-2 bg-primary/10 px-3 py-2 rounded-full">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('videoAudio')} {t('consultations')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-success/10 px-3 py-2 rounded-full">
                  <Pill className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">{t('medicines')} Delivery</span>
                </div>
                <div className="flex items-center space-x-2 bg-warning/10 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-card p-4 rounded-lg shadow-card hover:shadow-medical transition-shadow duration-300">
                <div className="text-2xl font-bold text-primary">1,250+</div>
                <div className="text-sm text-muted-foreground">{t('activePatients')}</div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-card hover:shadow-medical transition-shadow duration-300">
                <div className="text-2xl font-bold text-success">45+</div>
                <div className="text-sm text-muted-foreground">Qualified {t('doctor')}s</div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-card hover:shadow-medical transition-shadow duration-300">
                <div className="text-2xl font-bold text-warning">18+</div>
                <div className="text-sm text-muted-foreground">Partner {t('pharmacy')}s</div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-card hover:shadow-medical transition-shadow duration-300">
                <div className="text-2xl font-bold text-emergency">87.5%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="bg-gradient-subtle p-6 rounded-lg border border-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-semibold text-foreground mb-3">Trusted by Healthcare Professionals</h3>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>24/7 Monitoring</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login Section */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Card className="shadow-medical hover:shadow-glow transition-shadow duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t('login')} to TeleAsha</CardTitle>
                <CardDescription>
                  {/* Choose your role or use demo credentials to explore */}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    {roleButtons.map((roleData) => {
                      const Icon = roleData.icon;
                      return (
                        <Button
                          key={roleData.role}
                          type="button"
                          variant={selectedRole === roleData.role ? "medical" : "outline"}
                          className={`flex flex-col items-center px-4 py-2 ${selectedRole === roleData.role ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedRole(roleData.role)}
                          disabled={loading}
                        >
                          <Icon className={`h-5 w-5 mb-1 ${roleData.color}`} />
                          <span className="text-xs font-medium capitalize">{t(roleData.role)}</span>
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    type="submit"
                    variant="medical"
                    className="w-full transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? t('signingIn') : t('signIn')}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    {/* <span className="bg-card px-2 text-muted-foreground">{t('demoAccess')}</span> */}
                  </div>
                </div>

                {/* Removed quick login grid, now role selection is above */}

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowSignUp(true)}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create New Account</span>
                  </Button>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;