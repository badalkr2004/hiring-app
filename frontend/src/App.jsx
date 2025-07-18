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
import AdminUserProfile from "./components/dashboards/superAdmin/AdminUserProfile";
import AdminCompanyList from "./components/dashboards/superAdmin/CompanyList";
import AdminCompanyView from "./components/dashboards/superAdmin/AdminCompanyProfile";
import AdminCompanyEdit from "./components/dashboards/superAdmin/AdminCompanyEdit";

import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";

import ChatApp from "./components/chat/chatLayout";
import CommunityList from "./components/community/commnityList";
import CreateCommunity from "./components/community/createCommunity";
import CommunityDetail from "./components/community/commnunityDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const userId = localStorage.getItem("userId");
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
                path="/dashboard/users-management/:userId"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/company-management"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminCompanyList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/company-management/:companyId/view"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminCompanyView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/company-management/:companyId/edit"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminCompanyEdit />
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

              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:id" element={<CompanyDetailPage />} />
              <Route path="/message" element={<ProtectedRoute allowedRoles={["COMPANY", "ADMIN", "USER"]}><ChatApp /></ProtectedRoute>} />
              <Route path="/communities" element={<ProtectedRoute allowedRoles={["COMPANY", "ADMIN", "USER"]}><CommunityList /></ProtectedRoute>} />
              <Route path="/communities/create" element={<ProtectedRoute allowedRoles={["COMPANY", "ADMIN" , "USER"]}><CreateCommunity /></ProtectedRoute>} />
              <Route path="/communities/:id" element={<ProtectedRoute allowedRoles={["COMPANY", "ADMIN", "USER"]}><CommunityDetail /></ProtectedRoute>} />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
