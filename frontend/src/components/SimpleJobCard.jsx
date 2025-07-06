import { MapPin, Clock, DollarSign, Star, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  INACTIVE: "bg-gray-100 text-gray-500 border-gray-200",
  CLOSED: "bg-red-100 text-red-700 border-red-200",
};

const typeColors = {
  FULL_TIME: "bg-blue-100 text-blue-700 border-blue-200",
  PART_TIME: "bg-purple-100 text-purple-700 border-purple-200",
  CONTRACT: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REMOTE: "bg-orange-100 text-orange-700 border-orange-200",
  INTERNSHIP: "bg-pink-100 text-pink-700 border-pink-200",
};

const SimpleJobCard = ({ job }) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}/all-applicants`)}
      className="cursor-pointer bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-lg duration-200"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
          {job.title.length > 20 ? job.title.slice(0, 20) + "..." : job.title}
          {job.featured && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-1 rounded-full ml-2 animate-pulse">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Featured
            </span>
          )}
        </h3>
      </div>
      <p className="text-gray-700 mb-1 line-clamp-2 text-sm">
        {job.description}
      </p>
      <div className="flex flex-wrap gap-2 text-sm mb-2">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
          <MapPin className="h-4 w-4" />
          {job.location.length > 10
            ? job.location.slice(0, 10) + "..."
            : job.location}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
          <Clock className="h-4 w-4" />
          {formatDate(job.createdAt)}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
          <DollarSign className="h-4 w-4" />
          {job.salary.length > 14
            ? job.salary.slice(0, 14) + "..."
            : job.salary}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-medium mb-2">
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
            typeColors[job.type] || "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {job.type.replace("_", " ").toUpperCase()}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
          {job.category}
        </span>
        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
            statusColors[job.status] ||
            "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {job.status}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Applications: {job._count?.applications ?? 0}
          </span>
          {job.expiresAt && (
            <span className="text-orange-600 font-medium">
              Expires {formatDate(job.expiresAt)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <button
            className="text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:underline transition-all duration-200 ml-4"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/jobs/${job.id}/all-applicants`);
            }}
          >
            View Applicants →
          </button>
        </span>
      </div>
    </div>
  );
};

export default SimpleJobCard;
