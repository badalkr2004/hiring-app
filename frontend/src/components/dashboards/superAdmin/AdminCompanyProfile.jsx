import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  Edit3,
  ArrowLeft,
  Briefcase,
  Eye,
} from "lucide-react";
import { api } from "../../../libs/apis";

const AdminCompanyView = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/companies/${companyId}`);
        setCompany(response.data.company);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

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

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Company Not Found
          </h2>
          <p className="text-slate-600 mb-4">
            The company you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/company-management")}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Companies</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold text-slate-900">
                    {company.name}
                  </h1>
                  {company.verified ? (
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  ) : (
                    <Clock className="h-8 w-8 text-amber-500" />
                  )}
                </div>
                <p className="text-slate-600 text-lg">{company.industry}</p>
              </div>
            </div>

            <Link
              to={`/dashboard/company-management/${company.id}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Edit3 className="h-5 w-5" />
              <span className="font-medium">Edit Company</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Basic Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600">Company Name</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {company.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Industry</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {company.industry}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Company Size</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {company.size || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Contact & Location
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600">Location</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {company.location || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Website</p>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                          {company.website}
                        </a>
                      ) : (
                        <p className="text-lg font-semibold text-slate-900">
                          Not specified
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Founded</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {company.foundedYear || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {company.description && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {company.description}
                  </p>
                </div>
              )}
            </div>

            {/* Active Jobs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Active Jobs ({company._count.jobs})
                </h2>
              </div>

              {company.jobs.length > 0 ? (
                <div className="space-y-4">
                  {company.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{job.type}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center space-x-1">
                                <span>${job.salary}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            {job._count.applications} applications •{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No active jobs posted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Company Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Verification Status</span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      company.verified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {company.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Jobs</span>
                  <span className="font-semibold text-slate-900">
                    {company._count.jobs}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Member Since</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                {company.location && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>{company.size} employees</span>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>Founded {company.foundedYear}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyView;
