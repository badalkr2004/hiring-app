import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { useJob } from "../hooks/useJobs";

const JobDetailPage = () => {
  const { id } = useParams();
  const { data: job, isLoading, error } = useJob(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="bg-white rounded-xl p-8 mb-8">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job not found
          </h2>
          <p className="text-gray-600 mb-4">
            The job you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to jobs</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <p className="text-blue-100 text-lg">{job.company}</p>
                  <div className="flex items-center space-x-4 mt-3 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatDate(job.postedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Job Details */}
                <div className="mb-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {job.type.replace("-", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {job.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {job.salary}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Job Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {job.description}
                  </p>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Requirements
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Benefits
                  </h3>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Apply for this job
                  </h3>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium mb-3">
                    Apply Now
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                    Save for Later
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Company Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Company
                      </label>
                      <p className="text-gray-900">{job.company}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Industry
                      </label>
                      <p className="text-gray-900">Technology</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Company Size
                      </label>
                      <p className="text-gray-900">50-200 employees</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Location
                      </label>
                      <p className="text-gray-900">{job.location}</p>
                    </div>
                  </div>
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
