import { mockJobs } from "../data/mockJobs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Update mock jobs to include companyId and status
const updatedMockJobs = mockJobs.map((job) => ({
  ...job,
  companyId: "1", // Default to first company
  status: "active",
  applicationsCount: Math.floor(Math.random() * 20) + 1,
}));

export const jobService = {
  async getJobs(filters) {
    await delay(500);

    let filteredJobs = [...updatedMockJobs];

    if (filters?.search) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters?.location) {
      filteredJobs = filteredJobs.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters?.type && filters.type !== "all") {
      filteredJobs = filteredJobs.filter((job) => job.type === filters.type);
    }

    if (filters?.category && filters.category !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.category === filters.category
      );
    }

    return filteredJobs;
  },

  async getJobById(id) {
    await delay(300);
    return updatedMockJobs.find((job) => job.id === id) || null;
  },

  async getJobsByCompany(companyId) {
    await delay(400);
    return updatedMockJobs.filter((job) => job.companyId === companyId);
  },

  async createJob(jobData) {
    await delay(800);
    const newJob = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split("T")[0],
      status: "active",
      applicationsCount: 0,
    };
    updatedMockJobs.push(newJob);
    return newJob;
  },
};
