// src/services/api.js
import axios from "axios";

// Create API instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // This should be your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor that will be updated with current token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for common error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
