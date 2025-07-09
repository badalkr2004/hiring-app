import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building,
  MapPin,
  Globe,
  Calendar,
  Users,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { api } from "../libs/apis";
import JobCard from "../components/JobCard";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/companies/${id}`);
        setCompany(res.data?.company);
        document.title = `Job Flow - ${res.data?.company?.name || "Company"}`;
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Company not found");
      }
      setIsLoading(false);
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Company Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The company you're looking for doesn't exist."}
            </p>
            <Link
              to="/companies"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Companies</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/companies"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Companies</span>
          </Link>

          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full rounded object-cover"
                />
              ) : (
                <Building className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {company.name}
                </h1>
                {company.verified && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">
                {company.description}
              </p>

              <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                {company.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 flex items-center space-x-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.foundedYear}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{company.size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About {company.name}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {company.description ||
                  "No description available for this company."}
              </p>
            </div>

            {/* Jobs Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Open Positions ({company.jobs?.length || 0})</span>
                </h2>
              </div>

              {company.jobs && company.jobs.length > 0 ? (
                <div className="space-y-2">
                  {company.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={{
                        ...job,
                        company: { name: company.name },
                      }}
                      style={{
                        marginBottom: "10px",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Open Positions
                  </h3>
                  <p className="text-gray-600">
                    This company doesn't have any open positions at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Details
              </h3>

              <div className="space-y-4">
                {company.industry && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Industry
                    </span>
                    <p className="text-gray-900">{company.industry}</p>
                  </div>
                )}

                {company.size && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Company Size
                    </span>
                    <p className="text-gray-900">{company.size}</p>
                  </div>
                )}

                {company.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Location
                    </span>
                    <p className="text-gray-900">{company.location}</p>
                  </div>
                )}

                {company.foundedYear && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Founded
                    </span>
                    <p className="text-gray-900">{company.foundedYear}</p>
                  </div>
                )}

                {company.website && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Website
                    </span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <div className="flex items-center space-x-2">
                    {company.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          Verified Company
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600">Unverified</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Active Jobs
                  </span>
                  <p className="text-gray-900">
                    {company._count?.jobs || 0} positions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
