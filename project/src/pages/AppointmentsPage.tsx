import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LoginPage from '@/components/LoginPage';
import AppointmentManager from '@/components/AppointmentManager';

const AppointmentsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <AppointmentManager />
      </div>
    </Layout>
  );
};

export default AppointmentsPage;