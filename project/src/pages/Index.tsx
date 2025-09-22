import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/components/LoginPage';
import PatientDashboard from '@/components/dashboards/PatientDashboard';
import DoctorDashboard from '@/components/dashboards/DoctorDashboard';
import PharmacyDashboard from '@/components/dashboards/PharmacyDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'PATIENT':
      case 'patient':
        return <PatientDashboard />;
      case 'DOCTOR':
      case 'doctor':
        return <DoctorDashboard />;
      case 'PHARMACY':
      case 'pharmacy':
        return <PharmacyDashboard />;
      case 'ADMIN':
      case 'admin':
        return <AdminDashboard />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Index;
