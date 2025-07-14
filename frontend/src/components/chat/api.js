import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
  },
});

export default api;
