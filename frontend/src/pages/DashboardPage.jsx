import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import CompanyDashboard from '../components/dashboards/CompanyDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'user':
      return <UserDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default DashboardPage;