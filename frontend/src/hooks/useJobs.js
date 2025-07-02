import { useQuery } from "@tanstack/react-query";
import { jobService } from "../services/jobService";

export const useJobs = (filters) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJob = (id) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });
};
