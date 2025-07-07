import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Users,
  Calendar,
  Globe,
  CheckCircle,
  Clock,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../../../libs/apis";

const AdminCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    verified: "",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
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

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.industry && { industry: filters.industry }),
        ...(filters.verified && { verified: filters.verified }),
      };

      const response = await api.get("/companies", { params });
      setCompanies(response.data.companies);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      industry: "",
      verified: "",
      page: 1,
      limit: 12,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Company Management
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Manage and oversee all registered companies on the platform.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={filters.industry}
              onChange={(e) => handleFilterChange("industry", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            {/* Verification Filter */}
            <select
              value={filters.verified}
              onChange={(e) => handleFilterChange("verified", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            >
              <option value="">All Companies</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {companies.length} of {pagination.total} companies
          </p>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                        {company.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {company.industry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {company.verified ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Company Info */}
                <div className="space-y-3 mb-6">
                  {company.location && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{company.location}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{company.size} employees</span>
                    </div>
                  )}
                  {company.foundedYear && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Founded {company.foundedYear}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">
                      {company._count.jobs} active jobs
                    </span>
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                    {company.description}
                  </p>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      company.verified
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {company.verified ? "Verified" : "Pending"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/company-management/${company.id}/view`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/dashboard/company-management/${company.id}/edit`}
                      className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                pagination.page === 1
                  ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                  : "text-slate-700 bg-white hover:bg-slate-50"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {[...Array(pagination.pages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === pagination.pages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                        page === pagination.page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === pagination.page - 2 ||
                  page === pagination.page + 2
                ) {
                  return (
                    <span key={page} className="text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                pagination.page === pagination.pages
                  ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                  : "text-slate-700 bg-white hover:bg-slate-50"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanyList;
