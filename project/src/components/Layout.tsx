import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Activity, Phone, MapPin, Bell, Settings, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeSelector from '@/components/ThemeSelector';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) return <>{children}</>;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'text-primary';
      case 'patient':
        return 'text-success';
      case 'pharmacy':
        return 'text-warning';

      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 group">
                <div className="relative">
                  <Activity className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                  <Heart className="h-3 w-3 text-success absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-xl font-bold text-foreground">TeleAsha</h1>
              </div>
              <div className="hidden md:block text-sm text-muted-foreground">
                {t('welcome')} - Connecting Rural Communities to Healthcare
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Theme Selector */}
              <ThemeSelector />
              
              {/* Notification Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-emergency">
                  3
                </Badge>
              </Button>
              
              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-success rounded-full"></div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{user.name}</div>
                  <div className={`text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                    {t(user.role)}
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-emergency transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card/95 backdrop-blur-sm border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground flex items-center space-x-2">
              <Heart className="h-4 w-4 text-success" />
              <span>© 2025 TeleAsha - Bridging Healthcare Gaps</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 hover:text-emergency transition-colors cursor-pointer">
                <Phone className="h-4 w-4" />
                <span>{t('emergency')}: 108</span>
              </div>
              <div className="flex items-center space-x-1 hover:text-primary transition-colors">
                <MapPin className="h-4 w-4" />
                <span>{t('location')}: Gujarat, India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;