import { Link } from "react-router-dom";
import { Building, MapPin, Globe, Users, Calendar, CheckCircle } from "lucide-react";

const CompanyCard = ({ company }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link to={`/companies/${company.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition-all duration-200 p-6 flex flex-col gap-4 cursor-pointer group">
        {/* Logo and Name */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-md bg-blue-100">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-10 h-10 object-cover rounded-md"
              />
            ) : (
              <Building className="h-7 w-7 text-blue-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                {company.name}
              </h3>
              {company.verified && (
                <CheckCircle className="h-5 w-5 text-green-500" title="Verified" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {company.industry && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                  {company.industry}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${company.verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {company.verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>
        {/* Info Row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {company.location && (
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[90px]">
                {company.location.length > 18
                  ? company.location.slice(0, 18) + "…"
                  : company.location}
              </span>
            </span>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full hover:underline"
              onClick={e => e.stopPropagation()}
            >
              <Globe className="h-4 w-4" />
              <span className="truncate max-w-[90px]">
                {company.website.replace(/^https?:\/\//, '').slice(0, 18)}…
              </span>
            </a>
          )}
          {company.foundedYear && (
            <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span>{company.foundedYear}</span>
            </span>
          )}
          {company.size && (
            <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
              <Users className="h-4 w-4" />
              <span>{company.size}</span>
            </span>
          )}
        </div>
        {/* Description */}
        {company.description && (
          <p className="text-gray-700 text-sm line-clamp-3">
            {company.description.length > 140
              ? company.description.slice(0, 140) + "…"
              : company.description}
          </p>
        )}
        {/* Stats and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-gray-900">{company._count?.jobs || 0}</span>
            <span>Jobs</span>
          </div>
          <span className="text-xs text-gray-400">
            Joined {formatDate(company.createdAt)}
          </span>
          <span className="text-blue-600 font-semibold text-sm group-hover:underline transition-all duration-200">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CompanyCard;