import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Calendar,
  ArrowLeft,
  Bookmark,
  Share2,
  Globe,
  CheckCircle,
  Star,
  Eye,
  Briefcase,
  Zap,
} from "lucide-react";
import { useApiQuery } from "../libs/useApi";
import { useState, useEffect } from "react";

const JobDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useApiQuery(`/jobs/${id}`);
  const [job, setJob] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (data?.success) {
      setJob(data.data.job);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-6 w-1/2"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job not found
          </h2>
          <p className="text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getJobTypeColor = (type) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-green-100 text-green-800";
      case "PART_TIME":
        return "bg-blue-100 text-blue-800";
      case "CONTRACT":
        return "bg-purple-100 text-purple-800";
      case "INTERNSHIP":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors duration-200 group"
        >
          <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="font-medium">Back to jobs</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Building className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <p className="text-blue-100 text-lg font-medium">
                          {job.company.name}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-blue-100">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm">
                        <Bookmark className="h-5 w-5" />
                      </button>
                      <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 backdrop-blur-sm">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Salary</span>
                      </div>
                      <p className="text-lg font-bold">{job.salary}</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Type</span>
                      </div>
                      <p className="text-lg font-bold">
                        {job.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Category</span>
                      </div>
                      <p className="text-lg font-bold">{job.category}</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <p className="text-lg font-bold">{job.views}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getJobTypeColor(
                    job.type
                  )}`}
                >
                  {job.type.replace("_", " ")}
                </div>
                <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {job.category}
                </div>
                {job.featured && (
                  <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span>Job Description</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                {job.description}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Requirements</span>
              </h3>
              <ul className="space-y-3 mb-8">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <span>Benefits</span>
              </h3>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Apply for this job
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => navigate(`/jobs/${id}/apply`)}
                >
                  Apply Now
                </button>
                <button className="w-full border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium">
                  Save for Later
                </button>
              </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {job.company.name}
                  </h3>
                  {job.company.verified && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Industry</span>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {job.company.industry}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Company Size</span>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {job.company.size} employees
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {job.company.location}
                  </p>
                </div>
                {job.company.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </label>
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Visit website
                    </a>
                  </div>
                )}
              </div>

              {job.company.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">
                    About Company
                  </label>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {job.company.description}
                  </p>
                </div>
              )}
            </div>

            {/* Job Stats Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold text-gray-900">
                    {job._count.applications}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">
                    {job.views}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expires</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(job.expiresAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
