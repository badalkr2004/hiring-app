import React, { useMemo, useState, useEffect } from "react";
import { Briefcase, FileText, Clock, CheckCircle, X, Eye } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApiQuery } from "../../libs/useApi";
import ChatButton from "../chat/ChatButton";

const UserDashboard = () => {
  const { userData } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // You can adjust this as needed
  const [totalPages, setTotalPages] = useState(1);

  // Fetch applications with pagination
  const { data, isLoading } = useApiQuery(
    `/applications/my-applications?page=${page}&limit=${limit}`
  );
  const applications = useMemo(() => data?.data?.applications ?? [], [data]);

  useEffect(() => {
    if (data?.data?.pagination?.pages) {
      setTotalPages(data.data.pagination.pages);
    }
  }, [data]);

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <Eye className="h-4 w-4" />;
      case "shortlisted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const stats = [
    {
      label: "Applications Sent",
      value: applications.length,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Pending Review",
      value: applications.filter(
        (app) => app.status?.toLowerCase() === "pending"
      ).length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Reviewed",
      value: applications.filter(
        (app) => app.status?.toLowerCase() === "reviewed"
      ).length,
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Shortlisted",
      value: applications.filter(
        (app) => app.status?.toLowerCase() === "shortlisted"
      ).length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Rejected",
      value: applications.filter(
        (app) => app.status?.toLowerCase() === "rejected"
      ).length,
      icon: X,
      color: "text-red-600",
    },
    {
      label: "Hired",
      value: applications.filter((app) => app.status?.toLowerCase() === "hired")
        .length,
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back {userData?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your job applications and career progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-500 text-center">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1 text-center">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Applications
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start applying to jobs to see your applications here
              </p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Browse Jobs
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {application.job.title}
                        </h3>
                        <p className="text-gray-600">
                          {application.job.company?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(
                            application.appliedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="capitalize">
                          {application.status?.toLowerCase()}
                        </span>
                      </span>
                      <div className="text-blue-600 hover:text-blue-700 font-medium">
                        <ChatButton
                          text={"Chat with Employer"}
                          applicationId={application.id}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 py-6">
                <button
                  className="px-4 py-2 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-gray-600 mx-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-4 py-2 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
