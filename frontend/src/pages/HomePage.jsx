import { useState } from "react";
import { TrendingUp, Users, Building, MapPin } from "lucide-react";
import SearchBar from "../components/SearchBar";
import JobList from "../components/JobList";
import { useJobs } from "../hooks/useJobs";

const HomePage = () => {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    category: "",
    salaryRange: "",
  });

  const { data: jobs = [], isLoading } = useJobs(filters);

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
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dream Job
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover thousands of opportunities from top companies. Build your
              career with the perfect role that matches your skills and
              ambitions.
            </p>
          </div>

          <SearchBar filters={filters} onFiltersChange={setFilters} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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
      </div>
    </div>
  );
};

export default HomePage;
