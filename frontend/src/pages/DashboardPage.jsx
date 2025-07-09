import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import CompanyDashboard from '../components/dashboards/CompanyDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const DashboardPage = () => {
  const { userData } = useAuth();

  if (!userData) return null;

  useEffect(() => {
    document.title = "Job Flow - Dashboard";
  }, []);

  switch (userData.role) {
    case 'USER':
      return <UserDashboard />;
    case 'COMPANY':
      return <CompanyDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default DashboardPage;