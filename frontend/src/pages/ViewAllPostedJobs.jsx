import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApiQuery } from "../libs/useApi";
import SimpleJobList from "../components/SimpleJobList";

const JOBS_PER_PAGE = 10;

const ViewAllPostedJobs = () => {
  const { userData } = useAuth();
  const [page, setPage] = useState(1);

  // Determine endpoint based on role
  let endpoint = "/jobs";
  if (userData?.role === "COMPANY") {
    endpoint = "/jobs/company/my-jobs";
  } else if (userData?.role === "ADMIN") {
    endpoint = "/jobs"; // Admin sees all jobs
  }

  // Build params with pagination
  const params = {
    page,
    limit: JOBS_PER_PAGE,
  };  

  const { data, isLoading, isError } = useApiQuery(endpoint, { params });
  const jobs = data?.data?.jobs;
  const totalPages = data?.data?.pagination?.pages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Posted Jobs</h1>
        <p className="text-gray-600 mb-4">
          {userData?.role === "COMPANY"
            ? "View and manage all jobs posted by your company."
            : "View and manage all jobs on the platform."}
        </p>
        {isError ? (
          <div className="text-center text-red-600 py-12">Failed to load jobs. Please try again later.</div>
        ) : (
          <>
            <SimpleJobList jobs={jobs} isLoading={isLoading} />
            {/* Pagination Controls */}
            <div className="flex justify-center mt-8 gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
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
  );
};

export default ViewAllPostedJobs;