import React from "react";
import { useAuth } from "../contexts/AuthContext";
import UserSettings from "../components/settings/UserSetting";
import CompanySettings from "../components/settings/CompanySettings";
import AdminSettings from "../components/settings/AdminSetting";

const SettingsPage = () => {
  const { userData } = useAuth();

  if (!userData) return null;

  switch (userData.role) {
    case "USER":
      return <UserSettings />;
    case "COMPANY":
      return <CompanySettings />;
    case "ADMIN":
      return <AdminSettings />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default SettingsPage;
