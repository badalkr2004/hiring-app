import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "./apis";
import { CLOUD_NAME } from "../config/api";

export function useApiQuery(endpoint, options = {}) {
  const { params, token, queryOptions = {}, queryFnOverride } = options;
  const key = endpoint;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key, params],
    queryFn: queryFnOverride
      ? () => queryFnOverride(endpoint, options)
      : () => api.get(endpoint, { params, token }),
    retry: 1,
    staleTime: 1000 * 60,
    ...queryOptions,
  });
}

export function useApiMutation(method = "post", endpoint, options = {}) {
  const { params, token, mutationOptions = {}, mutationFnOverride } = options;

  return useMutation({
    mutationFn: mutationFnOverride
      ? (body) => mutationFnOverride(endpoint, body, options)
      : (body) => api[method](endpoint, body, { params, token }),
    ...mutationOptions,
  });
}

export function AddPhoto(cloudName = CLOUD_NAME) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const mutation = useMutation({
    mutationFn: (data) => {
      return fetch(url, {
        method: "POST",
        body: data,
      });
    },
  });
  return {
    handleUpload: async (data) => {
      try {
        const res = await mutation.mutateAsync(data);
        const response = await res.json();
        return response;
      } catch (err) {
        console.log(err);
        return {
          success: false,
          error: "something wents wrong.",
        };
      }
    },
    isUploadPending: mutation.isPending,
  };
}

export function AddResume(cloudName = CLOUD_NAME) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const mutation = useMutation({
    mutationFn: (data) => {
      return fetch(url, {
        method: "POST",
        body: data,
      });
    },
  });
  return {
    handleResumeUpload: async (data) => {
      try {
        const res = await mutation.mutateAsync(data);
        const response = await res.json();
        return response;
      } catch (err) {
        console.log(err);
        return {
          success: false,
          error: "something wents wrong.",
        };
      }
    },
    isResumeUploadPending: mutation.isPending,
  };
}
