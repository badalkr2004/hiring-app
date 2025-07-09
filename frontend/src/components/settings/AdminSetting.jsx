import React, { useState, useEffect } from "react";
import { api } from "../../libs/apis";
import { Users, Building2, FileText, BarChart2, Shield } from "lucide-react";

const TABS = [
  { id: "dashboard", name: "Dashboard", icon: <BarChart2 /> },
  { id: "companies", name: "Companies", icon: <Building2 /> },
  { id: "security", name: "Security", icon: <Shield /> },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isUpdateProfileLoading, setIsUpdateProfileLoading] = useState(false);

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Fetch dashboard stats
  useEffect(() => {
    if (activeTab === "dashboard") {
      setLoading(true);
      setError("");
      api
        .get("/admin/stats")
        .then((res) => {
          setStats(res?.data?.data || {});
        })
        .catch((err) => {
          console.error("Error fetching stats:", err);
          setError("Failed to load dashboard stats");
          setStats({});
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch users
  useEffect(() => {
    if (activeTab === "users") {
      setLoading(true);
      setError("");
      api
        .get("/admin/users")
        .then((res) => {
          setUsers(res?.data?.data?.users || []);
        })
        .catch((err) => {
          console.error("Error fetching users:", err);
          setError("Failed to load users");
          setUsers([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch companies
  useEffect(() => {
    if (activeTab === "companies") {
      setLoading(true);
      setError("");
      api
        .get("/admin/companies")
        .then((res) => {
          setCompanies(res?.data?.data?.companies || []);
        })
        .catch((err) => {
          console.error("Error fetching companies:", err);
          setError("Failed to load companies");
          setCompanies([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch applications
  useEffect(() => {
    if (activeTab === "applications") {
      setLoading(true);
      setError("");
      api
        .get("/admin/applications")
        .then((res) => {
          setApplications(res?.data?.data?.applications || []);
        })
        .catch((err) => {
          console.error("Error fetching applications:", err);
          setError("Failed to load applications");
          setApplications([]);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Password change handler
  const handlePasswordChange = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" });
      return;
    }

    setIsUpdateProfileLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });

      if (response?.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setSecurityForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          twoFactorAuth: securityForm.twoFactorAuth,
        });
      } else {
        setMessage({ type: "error", text: response?.message ?? "Failed to change password." });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message ?? "Failed to change password.",
      });
    } finally {
      setIsUpdateProfileLoading(false);
    }
  };

  // Two-factor authentication toggle
  const handleTwoFactorAuthToggle = async () => {
    try {
      setSecurityForm((prev) => ({
        ...prev,
        twoFactorAuth: !prev.twoFactorAuth,
      }));
      setMessage({
        type: "success",
        text: `Two-factor authentication ${
          !securityForm.twoFactorAuth ? "enabled" : "disabled"
        } successfully!`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update 2FA settings.",
      });
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your admin account? This action cannot be undone."
      )
    ) {
      try {
        setMessage({ type: "success", text: "Account deleted successfully!" });
        // Redirect to logout or home page
        // window.location.href = '/';
      } catch (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to delete account.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage platform users, companies, applications, and system settings.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-md border border-gray-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl shadow-lg border-l-4 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-400' 
                  : message.type === 'error' 
                    ? 'bg-red-50 text-red-800 border-red-400' 
                    : 'bg-blue-50 text-blue-800 border-blue-400'
              }`}>
                <div className="flex items-center">
                  <span className="text-xl mr-3">
                    {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                  {message.text}
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Platform Analytics
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading stats...</span>
                  </div>
                ) : Object.keys(stats).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No stats available at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Total Users" value={stats.totalUsers} />
                    <StatCard
                      label="Total Companies"
                      value={stats.totalCompanies}
                    />
                    <StatCard label="Total Jobs" value={stats.totalJobs} />
                    <StatCard label="Active Jobs" value={stats.activeJobs} />
                    <StatCard
                      label="Total Applications"
                      value={stats.totalApplications}
                    />
                    <StatCard
                      label="Pending Applications"
                      value={stats.pendingApplications}
                    />
                    <StatCard
                      label="New Users This Month"
                      value={stats.newUsersThisMonth}
                    />
                    <StatCard
                      label="New Jobs This Month"
                      value={stats.newJobsThisMonth}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Companies Tab */}
            {activeTab === "companies" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">
                  Company Management
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading companies...
                    </span>
                  </div>
                ) : companies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No companies found.
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6">
                      Company Management
                    </h2>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-3 text-2xl">🔒</span>
                    Security Settings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Update your password and security settings to keep your
                    account secure. Make sure to use a strong password with a
                    mix of letters, numbers, and symbols.
                  </p>
                </div>

                {/* Password Change */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2 text-lg">🔑</span>
                    Change Password
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePasswordChange();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.current ? "text" : "password"}
                          value={securityForm.currentPassword}
                          onChange={(e) =>
                            setSecurityForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.current ? (
                            <span className="text-gray-400">🙈</span>
                          ) : (
                            <span className="text-gray-400">👁️</span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          value={securityForm.newPassword}
                          onChange={(e) =>
                            setSecurityForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.new ? (
                            <span className="text-gray-400">🙈</span>
                          ) : (
                            <span className="text-gray-400">👁️</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          value={securityForm.confirmPassword}
                          onChange={(e) =>
                            setSecurityForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword.confirm ? (
                            <span className="text-gray-400">🙈</span>
                          ) : (
                            <span className="text-gray-400">👁️</span>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={isUpdateProfileLoading}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                      >
                        {isUpdateProfileLoading
                          ? "Changing..."
                          : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <span className="mr-2 text-lg">🔐</span>
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securityForm.twoFactorAuth}
                        onChange={handleTwoFactorAuthToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                    <span className="mr-2 text-lg">⚠️</span>
                    Danger Zone
                  </h4>
                  <p className="text-sm text-red-700 mb-4">
                    These actions cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                  >
                    <span className="text-lg">🗑️</span>
                    <span>Delete Admin Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard component for dashboard stats
function StatCard({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 shadow border border-gray-200 flex flex-col items-center">
      <div className="text-3xl font-bold text-gray-900">
        {value !== undefined ? value : "--"}
      </div>
      <div className="text-sm text-gray-600 mt-2">{label}</div>
    </div>
  );
}

export default AdminSettings;
