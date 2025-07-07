import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Save,
  X,
  ArrowLeft,
  Upload,
  Globe,
  MapPin,
  Users,
  Calendar,
} from "lucide-react";
import { api } from "../../../libs/apis";

const AdminCompanyEdit = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
    size: "",
    industry: "",
    location: "",
    foundedYear: "",
  });

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media",
    "Real Estate",
    "Transportation",
  ];

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/companies/${companyId}`);
        const companyData = response.data.company;
        setCompany(companyData);
        setFormData({
          name: companyData.name || "",
          description: companyData.description || "",
          logo: companyData.logo || "",
          website: companyData.website || "",
          size: companyData.size || "",
          industry: companyData.industry || "",
          location: companyData.location || "",
          foundedYear: companyData.foundedYear || "",
        });
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put(`/companies/${companyId}`, formData);
      if (response.success) {
        navigate(`/dashboard/company-management/${companyId}/view`);
      } else {
        alert(response.message || "Failed to update company.");
      }
    } catch (error) {
      console.error("Error updating company:", error);
      alert("An error occurred while updating the company.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading company details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Company</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  Edit Company
                </h1>
                <p className="text-slate-600 text-lg mt-1">
                  Update company information and details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Company Size
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="">Select Size</option>
                    {companySizes.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Company Description
              </h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us about your company..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Company Logo
              </h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
                {formData.logo && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-2">Preview:</p>
                    <img
                      src={formData.logo}
                      alt="Company Logo"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/companies/${id}`)}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyEdit;
