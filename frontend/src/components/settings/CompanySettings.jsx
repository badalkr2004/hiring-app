import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../libs/apis";
import { AddPhoto } from "../../libs/useApi";

const CompanySettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdateProfileLoading, setIsUpdateProfileLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const { handleUpload } = AddPhoto();

  const { userData, isLoading } = useAuth(); // isLoading is used to show a loading spinner when the user details are being fetched

  // update company details is in userDetails.company
  const [companyDetails, setCompanyDetails] = useState(
    userData.company ?? {
      name: "",
      website: "",
      industry: "",
      size: "",
      location: "",
      description: "",
      logo: "",
      foundedYear: "",
    }
  );

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [companyStats, setCompanyStats] = useState(null);

  const handleProfileChange = (field, value) => {
    setCompanyDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setLogoFile(file);
        setCompanyDetails((prev) => ({
          ...prev,
          logo: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdateProfileLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let logo = companyDetails.logo;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        formData.append("upload_preset", "c7rtf3gv");
        const response = await handleUpload(formData);
        logo = response.secure_url;
      }

      const response = await api.put("/companies/profile", {
        name: companyDetails.name,
        website: companyDetails.website,
        industry: companyDetails.industry,
        size: companyDetails.size,
        location: companyDetails.location,
        description: companyDetails.description,
        logo: logo,
        foundedYear: companyDetails.foundedYear,
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: "Company profile updated successfully!",
        });
        console.log(response);
      } else {
        setMessage({
          type: "error",
          text: response.message,
        });
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdateProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (securityForm.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters long.",
      });
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
        });
      } else {
        setMessage({ type: "error", text: response.message });
      }

    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password.",
      });
    } finally {
      setIsUpdateProfileLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Company Profile", icon: "🏢" },
    { id: "security", name: "Security", icon: "🔒" },
  ];

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

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your company account? This action cannot be undone."
      )
    ) {
      try {
        setMessage({ type: "success", text: "Account deleted successfully!" });
        // Redirect to logout or home page
      } catch (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to delete account.",
        });
      }
    }
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Company Settings
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your company profile, preferences, and security settings to
            optimize your hiring experience
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg border-l-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-400"
                : message.type === "error"
                ? "bg-red-50 text-red-800 border-red-400"
                : "bg-blue-50 text-blue-800 border-blue-400"
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {message.type === "success"
                  ? "✅"
                  : message.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </span>
              {message.text}
            </div>
          </div>
        )}

        {/* Company Statistics */}
        {companyStats && (
          <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-3 text-2xl">📊</span>
              Company Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Total Jobs
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {companyStats.totalJobs}
                    </p>
                  </div>
                  <span className="text-2xl">💼</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Active Jobs
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {companyStats.activeJobs}
                    </p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">
                      Applications
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {companyStats.totalApplications}
                    </p>
                  </div>
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">
                      Monthly Views
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {companyStats.viewsThisMonth}
                    </p>
                  </div>
                  <span className="text-2xl">👁️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-md border border-gray-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Logo Upload Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="mr-3 text-2xl">🏢</span>
                    Company Logo
                  </h3>
                  <div className="flex items-center space-x-8">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                        {companyDetails.logo || logoPreview ? (
                          <img
                            src={
                              logoPreview ? logoPreview : companyDetails.logo
                            }
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-3xl">🏢</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Upload Company Logo
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors duration-200"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Details Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveProfile();
                  }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={companyDetails.name} // companyDetails.name is the company name
                        onChange={(e) =>
                          handleProfileChange("name", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyDetails.website}
                        onChange={(e) =>
                          handleProfileChange("website", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Industry
                      </label>
                      <select
                        value={companyDetails.industry}
                        onChange={(e) =>
                          handleProfileChange("industry", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Company Size
                      </label>
                      <select
                        value={companyDetails.size}
                        onChange={(e) =>
                          handleProfileChange("size", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        value={companyDetails.location}
                        onChange={(e) =>
                          handleProfileChange("location", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="City, State/Country"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={companyDetails.foundedYear}
                        onChange={(e) =>
                          handleProfileChange(
                            "foundedYear",
                            parseInt(e.target.value) || ""
                          )
                        }
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Description
                    </label>
                    <textarea
                      value={companyDetails.description}
                      onChange={(e) =>
                        handleProfileChange("description", e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                      placeholder="Describe your company, mission, and values..."
                    />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={isUpdateProfileLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      {isUpdateProfileLoading ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                    <span>Delete Company Account</span>
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

export default CompanySettings;
