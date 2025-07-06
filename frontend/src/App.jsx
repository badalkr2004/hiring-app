import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import JobDetailPage from "./pages/JobDetailPage";
import PostJobPage from "./pages/PostJobPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { AuthProvider } from "./contexts/AuthContext";
import SettingsPage from "./pages/SettingPage";
import JobApplyPage from "./pages/JobApplyPage";
import UsersManagement from "./components/dashboards/superAdmin/UserList";
import ViewAllPostedJobs from "./pages/ViewAllPostedJobs";
import ViewAllApplicants from "./pages/ViewAllApplicants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* job apply page */}
              <Route
                path="/jobs/:id/apply"
                element={
                  <ProtectedRoute allowedRoles={["USER"]}>
                    <JobApplyPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/jobs"
                element={
                  <ProtectedRoute allowedRoles={["COMPANY", "ADMIN"]}>
                    <ViewAllPostedJobs />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={["COMPANY", "ADMIN"]}>
                    <ViewAllApplicants />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/dashboard/users-management"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/post-job"
                element={
                  <ProtectedRoute allowedRoles={["COMPANY", "ADMIN"]}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["USER", "COMPANY", "ADMIN"]}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
