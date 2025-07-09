import { api } from "../libs/apis";

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      if (response.success === false) {
        throw new Error(response.message || "Invalid credentials");
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  async signup(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      
      if (response.success === false) {
        throw new Error(response.message || "Registration failed");
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await api.get("/auth/profile");
      
      if (response.success === false) {
        throw new Error(response.message || "Failed to get user profile");
      }
      
      return response.data?.user;
    } catch (error) {
      throw new Error(error.message || "Failed to get current user");
    }
  },

  async getAllUsers() {
    try {
      const response = await api.get("/users");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch users");
    }
  },

  async getAllCompanies() {
    try {
      const response = await api.get("/companies");
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch companies");
    }
  },

  async updateUserStatus(userId, isActive) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update user status");
    }
  },

  async verifyCompany(companyId) {
    try {
      const response = await api.patch(`/admin/companies/${companyId}/verify`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to verify company");
    }
  },
};
