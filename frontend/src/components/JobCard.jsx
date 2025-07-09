import { Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Star, Building } from "lucide-react";

const JobCard = ({ job, style }) => {
  const navigate = useNavigate();
  const getTypeColor = (type) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-blue-100 text-blue-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      case "remote":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <div style={{...style}} className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {job.title?.length > 20
                  ? job.title.slice(0, 20) + "..."
                  : job.title || 'Untitled Job'}
              </h3>
              <p className="text-gray-600">{job.company?.name || 'Company'}</p>
            </div>
          </div>
          {job.featured && (
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-xs font-medium">Featured</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>
              {job.location?.length > 10
                ? job.location.slice(0, 10) + "..."
                : job.location || 'Remote'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(job.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary?.length > 16 ? job.salary.slice(0, 16) + "..." : job.salary || 'Salary not specified'}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {job.description?.length > 125
            ? job.description.slice(0, 125) + "..."
            : job.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                job.type
              )}`}
            >
              {job.type?.replace("_", " ").toUpperCase() || 'FULL-TIME'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {job.category?.length > 15
                ? job.category.slice(0, 15) + "..."
                : job.category || 'General'}
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline transition-all duration-200" onClick={() => navigate(`/jobs/${job.id}/apply`)}>
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
