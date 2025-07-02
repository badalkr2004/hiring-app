import { mockJobs } from "../data/mockJobs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock applications data
const mockApplications = [
  {
    id: "1",
    jobId: "1",
    userId: "3",
    companyId: "1",
    status: "pending",
    appliedDate: "2025-01-16",
    coverLetter: "I am very interested in this position...",
    user: {
      id: "3",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
      createdAt: "2024-02-01",
      isActive: true,
      location: "New York, NY",
      skills: ["React", "TypeScript", "Node.js"],
      experience: "5 years",
    },
    job: mockJobs[0],
  },
  {
    id: "2",
    jobId: "2",
    userId: "3",
    companyId: "1",
    status: "reviewed",
    appliedDate: "2025-01-15",
    user: {
      id: "3",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
      createdAt: "2024-02-01",
      isActive: true,
      location: "New York, NY",
      skills: ["React", "TypeScript", "Node.js"],
      experience: "5 years",
    },
    job: mockJobs[1],
  },
];

export const applicationService = {
  async getApplicationsByCompany(companyId) {
    await delay(500);
    return mockApplications.filter((app) => app.companyId === companyId);
  },

  async getApplicationsByUser(userId) {
    await delay(500);
    return mockApplications.filter((app) => app.userId === userId);
  },

  async getAllApplications() {
    await delay(500);
    return mockApplications;
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
