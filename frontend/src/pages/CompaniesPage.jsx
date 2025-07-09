import { useState, useEffect } from "react";
import { Building, Search, Filter, MapPin, Users, Globe } from "lucide-react";
import CompanyList from "../components/CompanyList";
import { api } from "../libs/apis";

const CompaniesPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    verified: "",
  });
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch companies from API when filters change
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        // Build query params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.industry && filters.industry !== "all") params.industry = filters.industry;
        if (filters.verified && filters.verified !== "all") params.verified = filters.verified;
        // pagination
        const limit = 9; // companies per page
        params.page = page;
        params.limit = limit;

        const res = await api.get("/companies", { params });
        setCompanies(res.data?.companies || []);
        setTotalPages(res.data?.pagination?.pages || 1);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanies([]);
      }
      setIsLoading(false);
    };
    fetchCompanies();
    document.title = "Job Flow - Companies";
  }, [filters, page]);

  const stats = [
    {
      label: "Total Companies",
      value: "892",
      icon: Building,
      color: "text-blue-600",
    },
    {
      label: "Verified Companies",
      value: "756",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Active Industries",
      value: "24",
      icon: Globe,
      color: "text-purple-600",
    },
    {
      label: "New This Month",
      value: "45",
      icon: MapPin,
      color: "text-orange-600",
    },
  ];

  const industries = [
    "Technology",
    "Healthcare", 
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Marketing",
    "All"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Discover{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Amazing Companies
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore top companies from various industries. Find your next career opportunity 
              with organizations that match your values and aspirations.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Industry Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry === "All" ? "" : industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Filter */}
              <div className="relative">
                <select
                  value={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Companies</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Non-Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-0 mt-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 py-8">
        <CompanyList companies={companies} isLoading={isLoading} />
        
        {/* Pagination Controls */}
        {!isLoading && companies.length > 0 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition-colors"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;