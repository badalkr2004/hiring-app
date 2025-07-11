import { useEffect, useState } from "react";
import { applicationService } from "../services/applicationService";
import {
  Search,
  Download,
  FileText,
  Users,
  CheckCircle,
  Clock,
  X,
  Briefcase,
  MapPin,
  Linkedin,
  Github,
  Globe,
} from "lucide-react";
import { api } from "../libs/apis";
import { useParams, useSearchParams } from "react-router-dom";
import ChatButton from "../components/chat/ChatButton";

const statusColors = {
  REVIEW: "bg-purple-100 text-purple-700",
  SHORTLISTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  HIRED: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

const TABS = ["Resume", "Cover Letter"];
const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "REVIEWED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
];

const getInitials = (user) => {
  if (!user) return "?";
  return `${user.firstName?.[0] ?? ""}${
    user.lastName?.[0] ?? ""
  }`.toUpperCase();
};

const formatDateAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Applied today";
  if (diff === 1) return "Applied yesterday";
  if (diff < 30) return `Applied ${diff} days ago`;
  const weeks = Math.floor(diff / 7);
  if (weeks < 5) return `Applied ${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(diff / 30);
  return `Applied ${months} month${months > 1 ? "s" : ""} ago`;
};

const ViewAllApplicants = ({ jobId }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const applicantId = searchParams.get("applicantId");
  const [applications, setApplications] = useState([]);
  console.log(applications);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("Resume");
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState("");

  // Fetch applicants for a specific job (mock: filter by jobId)
  useEffect(() => {
    (async () => {
      setLoading(true);
      let data = await api.get(`/applications/job/${id}`);
      setApplications(data.data.applications || []);
      setFiltered(data.data.applications || []);
      setSelected(
        data.data.applications.find((a) => a.user.id === applicantId) ||
          data.data.applications[0]
      );
      setAppStatus(data.data.applications[0]?.status || "");
      setLoading(false);
    })();
  }, [id, applicantId]);

  // Filter by search and status
  useEffect(() => {
    let result = applications;
    if (statusFilter !== "ALL") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (search) {
      result = result.filter((a) =>
        `${a.user.firstName} ${a.user.lastName} ${a.user.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, statusFilter, applications]);

  // Stats
  const stats = [
    {
      label: "Total Applicants",
      value: applications.length,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Shortlisted",
      value: applications.filter((a) => a.status === "SHORTLISTED").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Pending",
      value: applications.filter((a) => a.status === "PENDING").length,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Rejected",
      value: applications.filter((a) => a.status === "REJECTED").length,
      icon: X,
      color: "text-red-600",
    },
  ];

  // Helper: Social links
  const SocialLinks = ({ user }) => (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {user.linkedin && (
        <a
          href={user.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-900"
          title="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      )}
      {user.github && (
        <a
          href={user.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-800 hover:text-black"
          title="GitHub"
        >
          <Github className="h-5 w-5" />
        </a>
      )}
      {user.portfolio && (
        <a
          href={user.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-700 hover:text-indigo-900"
          title="Portfolio"
        >
          <Globe className="h-5 w-5" />
        </a>
      )}
    </div>
  );

  const handleStatusChange = async (newStatus) => {
    let note = prompt(
      `Add a note for ${selected.user.firstName} ${selected.user.lastName} (${newStatus})`
    );

    if (!selected) return;
    try {
      const status = await api.patch(`/applications/${selected.id}/status`, {
        status: newStatus,
        note,
      });
      setAppStatus(status.data.application.status);
      console.log(status);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Applicants for this Job
          </h1>
          <span className="ml-3 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold">
            Live
          </span>
        </div>
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 flex items-center gap-3 border border-gray-200 shadow-sm"
              >
                <Icon className={`h-7 w-7 ${stat.color}`} />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-lg">
        {/* Left: Applicants List */}
        <div className="w-[340px] bg-gradient-to-b from-blue-50 to-indigo-50 border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-400"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No applicants found.
              </div>
            ) : (
              filtered.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-all ${
                    selected?.id === app.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-transparent hover:bg-blue-100"
                  } rounded-lg mb-1`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white">
                    {getInitials(app.user)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {app.user.firstName} {app.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateAgo(app.appliedDate)}
                    </div>
                  </div>
                  <span
                    className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[app.status] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Right: Applicant Details */}
        <div className="flex-1 flex flex-col bg-white">
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Top: Profile */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-4 md:px-8 py-6 border-b border-gray-200 w-full">
                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                    {getInitials(selected.user)}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                    <div className="text-2xl font-bold text-gray-900 truncate">
                      {selected.user.firstName} {selected.user.lastName}
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-2">
                      <span className="bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 text-blue-700 border border-blue-200">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{selected.user.email}</span>
                      </span>
                      <SocialLinks user={selected.user} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusColors[appStatus] || "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {formatDateAgo(selected.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex md:flex-col items-center gap-2 md:gap-0 mt-2 md:mt-0">
                  <button
                    className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                    disabled={!selected.resume}
                    onClick={() =>
                      selected.resume && window.open(selected.resume, "_blank")
                    }
                  >
                    <Download
                      className={`h-6 w-6 ${
                        selected.resume ? "text-blue-600" : "text-gray-300"
                      }`}
                    />
                  </button>
                  <div className="p-2 rounded-lg hover:bg-blue-100 transition-colors">
                    <ChatButton text={"Chat"} applicationId={selected.id} />
                  </div>
                </div>
              </div>
              {/* Details Card */}
              <div className="px-4 md:px-8 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <Briefcase className="h-5 w-5" />
                    <span className="font-semibold">Experience:</span>
                    <span>{selected.user.experience || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <MapPin className="h-5 w-5" />
                    <span className="font-semibold">Location:</span>
                    <span>{selected.user.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Skills:</span>
                    <span>{selected.user.skills?.join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 px-4 md:px-8 py-4 border-b border-gray-200">
                <button
                  onClick={() => handleStatusChange("SHORTLISTED")}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange("REVIEW")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                >
                  Review
                </button>
                <button
                  onClick={() => handleStatusChange("REJECTED")}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange("HIRED")}
                  className="bg-blue-600 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all"
                >
                  Hire
                </button>
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-2 px-4 md:px-8 pt-4 border-b border-gray-200 bg-white overflow-x-auto">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-all ${
                      tab === t
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-white">
                {tab === "Resume" &&
                  (selected.resume ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(
                        selected.resume
                      )}&embedded=true`}
                      width="100%"
                      height="600px"
                      style={{ border: "none" }}
                    ></iframe>
                  ) : (
                    <div className="text-gray-400 text-center py-16">
                      No resume uploaded.
                    </div>
                  ))}
                {tab === "Cover Letter" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 text-base min-h-[60px]">
                    {selected.coverLetter || (
                      <span className="italic text-gray-400">
                        No cover letter provided.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select an applicant to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllApplicants;
