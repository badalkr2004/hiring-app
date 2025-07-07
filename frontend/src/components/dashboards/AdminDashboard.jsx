import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building,
  Briefcase,
  TrendingUp,
  Shield,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../libs/apis";

const AdminDashboard = () => {
  // Fetch dashboard stats
  const [stats, setStats] = React.useState(null);
  const [statsLoading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch latest users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["latestUsers"],
    queryFn: async () => {
      try {
        const response = await api.get("/users/all", {
          params: { page: 1, limit: 2 },
        });
        return response.data.users;
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // Fetch latest companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["latestCompanies"],
    queryFn: async () => {
      try {
        const response = await api.get("/companies", {
          params: { page: 1, limit: 2 },
        });
        return response.data.companies;
      } catch (error) {
        console.error("Error fetching companies:", error);
        return [];
      }
    },
  });

  const dashboardStats = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Total Companies",
      value: stats?.totalCompanies || 0,
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Total Applications",
      value: stats?.totalApplications || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">
            Manage users, companies, and platform analytics
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {statsLoading ? "..." : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                User Management
              </h2>
              <Link to="/dashboard/users-management">
                <button className="text-sm font-medium hover:underline bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded">
                  Manage Users
                </button>
              </Link>
            </div>

            {usersLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Companies Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Company Management
              </h2>
              <Link to="/dashboard/company-management">
                <button className="text-sm font-medium hover:underline bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded">
                  Manage Companies
                </button>
              </Link>
            </div>

            {companiesLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {companies.map((company) => (
                  <div key={company.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {company.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {company.industry} • {company.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
