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

  // Role is now determined from backend during login

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
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
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full floating-element"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/5 rounded-full floating-element" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-success/5 rounded-full floating-element" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Header */}
      <header className="glass-effect border-b border-border/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-2xl font-bold gradient-text">TeleAsha</h1>
              <div className="hidden sm:block px-3 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                Healthcare for All
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <LanguageSelector />
              <ThemeSelector />
              <div className="flex items-center space-x-2 bg-emergency/10 px-3 py-2 rounded-full">
                <Phone className="h-4 w-4 text-emergency" />
                <span className="font-medium text-emergency">{t('emergency')}: 108</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
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
          <div className="space-y-8 animate-slide-up relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-success/10 px-4 py-2 rounded-full text-success font-medium text-sm animate-bounce-gentle">
                <Heart className="h-4 w-4" />
                <span>Trusted by 10,000+ Patients</span>
              </div>
              <h2 className="text-5xl font-bold text-foreground leading-tight">
                Connecting Rural Communities to
                <span className="gradient-text"> Quality Healthcare</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Bridge the healthcare gap with our comprehensive telemedicine platform. 
                Get expert consultations, digital prescriptions, and medicine availability 
                checks from the comfort of your village.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center space-x-3 bg-primary/10 px-4 py-3 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all duration-300">
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('videoAudio')} {t('consultations')}</span>
                </div>
                <div className="flex items-center space-x-3 bg-success/10 px-4 py-3 rounded-xl border border-success/20 hover:bg-success/20 transition-all duration-300">
                  <Pill className="h-5 w-5 text-success" />
                  <span className="font-medium">{t('medicines')} Delivery</span>
                </div>
                <div className="flex items-center space-x-3 bg-warning/10 px-4 py-3 rounded-xl border border-warning/20 hover:bg-warning/20 transition-all duration-300">
                  <Clock className="h-5 w-5 text-warning" />
                  <span className="font-medium">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="medical-card p-6 group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">1,250+</div>
                    <div className="text-sm text-muted-foreground font-medium">{t('activePatients')}</div>
                  </div>
                </div>
              </div>
              <div className="medical-card p-6 group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
                    <Stethoscope className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-success">45+</div>
                    <div className="text-sm text-muted-foreground font-medium">Qualified {t('doctor')}s</div>
                  </div>
                </div>
              </div>
              <div className="medical-card p-6 group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center group-hover:bg-warning/20 transition-colors">
                    <Building2 className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-warning">18+</div>
                    <div className="text-sm text-muted-foreground font-medium">Partner {t('pharmacy')}s</div>
                  </div>
                </div>
              </div>
              <div className="medical-card p-6 group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center group-hover:bg-emergency/20 transition-colors">
                    <Activity className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emergency">97.5%</div>
                    <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
                  </div>
                </div>
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
          <div className="space-y-6 animate-slide-up relative z-10" style={{ animationDelay: '0.3s' }}>
            <Card className="shadow-medical hover:shadow-glow transition-all duration-500 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold gradient-text">{t('login')} to TeleAsha</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                  Access your healthcare dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 pl-4 pr-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pl-4 pr-4 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{t('signingIn')}...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5" />
                        <span>{t('signIn')}</span>
                      </div>
                    )}
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

                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 text-muted-foreground">New to TeleAsha?</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowSignUp(true)}
                    className="w-full h-12 text-lg font-medium border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    <span>Create New Account</span>
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
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