import { mockJobs } from "../data/mockJobs";
import { api } from "../libs/apis";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock applications data

export const applicationService = {
  async getApplicationsByCompany(companyId) {
    const response = await api.get("/applications/company-applications");
    return response.data.applications;
  },

  async getApplicationsByUser(userId) {
    await delay(500);
    return mockApplications.filter((app) => app.userId === userId);
  },

  async getAllApplications() {
    const response = await api.get("/applications/company-applications");
    return response.data.applications;
  },

  async updateApplicationStatus(applicationId, status) {
    await delay(300);
    const application = mockApplications.find(
      (app) => app.id === applicationId
    );
    if (application) {
      application.status = status;
    }
  },

  async applyToJob(jobId, userId, coverLetter) {
    await delay(500);
    const job = mockJobs.find((j) => j.id === jobId);
    if (!job) throw new Error("Job not found");

    const newApplication = {
      id: Date.now().toString(),
      jobId,
      userId,
      companyId: job.companyId,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
      coverLetter,
      user: {
        id: userId,
        email: "user@example.com",
        firstName: "User",
        lastName: "Name",
        role: "user",
        createdAt: "2024-01-01",
        isActive: true,
      },
      job,
    };

    mockApplications.push(newApplication);
  },

  async getDashboardStats() {
    await delay(400);
    return {
      totalJobs: mockJobs.length,
      totalApplications: mockApplications.length,
      totalCompanies: 15,
      totalUsers: 1250,
      activeJobs: mockJobs.filter((j) => j.status === "active").length,
      pendingApplications: mockApplications.filter(
        (a) => a.status === "pending"
      ).length,
      newApplicationsToday: 8,
      jobsPostedThisMonth: 45,
    };
  },
};
