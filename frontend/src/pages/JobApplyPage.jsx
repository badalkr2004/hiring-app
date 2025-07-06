import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApiQuery, useApiMutation, AddResume } from "../libs/useApi";
import {
  ArrowLeft,
  Building,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";

const JobApplyPage = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { userData, isLoggedIn } = useAuth();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch job details
  const { data: jobData, isLoading: jobLoading } = useApiQuery(
    `/jobs/${jobId}`
  );
  const { data: isAppliedData, isLoading: isAppliedLoading } = useApiQuery(
    `/applications/applied/status?jobId=${jobId}`
  );
  const job = useMemo(() => jobData?.data?.job, [jobData]);
  const isApplied = useMemo(
    () => isAppliedData?.data?.applied,
    [isAppliedData]
  );

  useEffect(() => {
    setResumeUrl(userData?.resume);
  }, [userData]);

  // Resume upload
  const { handleResumeUpload, isResumeUploadPending } = AddResume();

  // Application mutation
  const applyMutation = useApiMutation(
    "post",
    `/applications/jobs/${jobId}/apply`,
    {
      mutationOptions: {
        onSuccess: () => {
          setMessage({
            type: "success",
            text: "Application submitted successfully!",
          });
          setTimeout(() => navigate(`/jobs/${jobId}`), 2000);
        },
        onError: (err) => {
          setMessage({
            type: "error",
            text: err?.message || "Failed to apply.",
          });
        },
      },
    }
  );

  // Check if already applied (mock, replace with real check if needed)
  // You could fetch user applications and check for jobId match

  // Handle resume upload
  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "c7rtf3gv");
      formData.append("resource_type", "auto");
      const response = await handleResumeUpload(formData);
      if (response.url) {
        setResumeUrl(response.secure_url);
        setMessage({ type: "success", text: "Resume uploaded!" });
      } else {
        setMessage({ type: "error", text: "Resume upload failed." });
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    if (!coverLetter.trim()) {
      setMessage({ type: "error", text: "Cover letter is required." });
      return;
    }
    applyMutation.mutate({ coverLetter, resume: resumeUrl });
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please log in to apply</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to apply for jobs.
          </p>
          <Link
            to="/login"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Already applied (mock, replace with real check)
  if (isApplied) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You've already applied!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. We'll be in touch if you're
            shortlisted.
          </p>
          <Link
            to={`/jobs/${jobId}`}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium"
          >
            Back to Job
          </Link>
        </div>
      </div>
    );
  }

  // Loading job
  if (jobLoading || isAppliedLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-2">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 mr-3"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Apply for {job.title}
          </h1>
        </div>

        {/* Job Summary Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
              <p className="text-blue-700 font-medium">{job.company.name}</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>{job.type.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{job.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6"
        >
          {/* User Info */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {userData?.firstName?.[0]}
              {userData?.lastName?.[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {userData?.firstName} {userData?.lastName}
              </div>
              <div className="text-gray-500 text-sm">{userData?.email}</div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="coverLetter"
            >
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              id="coverLetter"
              className="w-full border border-gray-200 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
              placeholder="Write a brief cover letter explaining why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor="resume"
            >
              Resume (optional)
            </label>
            <div className="flex items-center justify-between gap-3">
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={handleResumeChange}
                disabled={isResumeUploadPending}
              />
              {isResumeUploadPending && (
                <span className="text-blue-500 text-xs">Uploading...</span>
              )}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  <div className="w-[180px]">View Uploaded Resume</div>
                </a>
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {message.text && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-60"
            disabled={applyMutation.isPending || isResumeUploadPending}
          >
            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobApplyPage;
