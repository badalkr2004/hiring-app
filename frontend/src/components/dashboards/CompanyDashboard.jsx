import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Users,
  Eye,
  CheckCircle,
  X,
  Clock,
  Plus,
  MapPin,
  DollarSign,
  Tag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { applicationService } from "../../services/applicationService";
import { useApiQuery } from "../../libs/useApi";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["company-applications", user?.id],
    queryFn: () => applicationService.getApplicationsByCompany(user.id),
    enabled: !!user,
  });

  const { data: jobData = [], isLoading: jobsLoading } = useApiQuery(`/jobs/company/my-jobs`);
  useEffect(() => {
    if(jobData?.success) {
      setJobs(jobData.data.jobs);
    }
  }, [jobData]);

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, status }) =>
      applicationService.updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-applications"] });
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
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

  const handleStatusUpdate = (applicationId, status) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  const stats = [
    {
      label: "Active Jobs",
      value: jobs.filter((job) => job.status === "active").length,
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Total Applications",
      value: applications.length,
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Pending Review",
      value: applications.filter((app) => app.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Shortlisted",
      value: applications.filter((app) => app.status === "shortlisted").length,
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your job postings and applications
            </p>
          </div>
          <Link
            to="/post-job"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
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
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Applications
              </h2>
            </div>

            {applicationsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
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
            ) : applications.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600">
                  Applications will appear here when candidates apply to your
                  jobs
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {application.user.firstName[0]}
                            {application.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {application.user.firstName}{" "}
                            {application.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {application.job.title}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.id, "reviewed")
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.id, "shortlisted")
                        }
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Shortlist</span>
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.id, "rejected")
                        }
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Job Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Job Posts
              </h2>
              <Link
                to="/company/jobs"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium text-sm shadow-sm"
              >
                View All Job Posts
              </Link>
            </div>

            {jobsLoading ? (
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs posted
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by posting your first job
                </p>
                <Link
                  to="/post-job"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="p-4 grid gap-6">
                {jobs.slice(0, 2).map((job) => (
                  <div
                    key={job.id}
                    className="cursor-pointer relative bg-white rounded-2xl shadow-md border-l-4 border-blue-500 p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow duration-200"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          {job.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        <span>{job.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mt-2">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{job._count?.applications || 0} applications</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{job.views || 0} views</span>
                        </span>
                      </div>
                      <div className="text-right">
                        {job.expiresAt && (
                          <span className="text-xs text-orange-600 font-medium">
                            Expires {new Date(job.expiresAt).toLocaleDateString()}
                          </span>
                        )}
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

export default CompanyDashboard;
