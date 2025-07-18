import { useState, useEffect } from "react";
import { TrendingUp, Users, Building, MapPin } from "lucide-react";
import SearchBar from "../components/SearchBar";
import JobList from "../components/JobList";
import { api } from "../libs/apis";
// Make sure this path is correct

const HomePage = () => {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    category: "",
    salaryRange: "",
  });
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);

  // Fetch jobs from API when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // Build query params from filters
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.location) params.location = filters.location;
        if (filters.type && filters.type !== "all") params.type = filters.type;
        if (filters.category && filters.category !== "all")
          params.category = filters.category;
        if (filters.salaryRange && filters.salaryRange !== "all")
          params.salaryRange = filters.salaryRange;
        // pagination
        const limit = 9; // jobs per page
        params.page = page;
        params.limit = limit;

        const res = await api.get("/jobs", { params });
        console.log(res.data.jobs);
        setJobs(res.data?.jobs || []);
        setTotalPages(res.data?.pagination.pages || 1);
      } catch (err) {
        setJobs([]);
      }
      setIsLoading(false);
    };
    fetchJobs();
    document.title = "Job Flow - Home";
  }, [filters, page]);

  const stats = [
    {
      label: "Active Jobs",
      value: "2,847",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      label: "Companies",
      value: "892",
      icon: Building,
      color: "text-green-600",
    },
    {
      label: "New This Week",
      value: "156",
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "Remote Jobs",
      value: "1,204",
      icon: MapPin,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="relative overflow-hidden">
        <img
          src="https://res.cloudinary.com/dlyfwiaon/image/upload/v1752122296/jobFlow/pexels-mart-production-7605814_tnlfzj.jpg"
          alt="Office background"
          className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dream Job
              </span>
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Discover thousands of opportunities from top companies. Build your
              career with the perfect role that matches your skills and
              ambitions.
            </p>
          </div>

          <SearchBar filters={filters} onFiltersChange={setFilters} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
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

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <JobList jobs={jobs} isLoading={isLoading} />
        {/* Pagination Controls */}
        <div className="flex justify-center mt-8 gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {page} / {totalPages}
          </span>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
