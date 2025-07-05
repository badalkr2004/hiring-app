import { api } from '../config/api';

export const companySettingsService = {
  // Get company profile
  async getCompanyProfile() {
    try {
      const response = await api.get('/companies/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company profile');
    }
  },

  // Update company profile
  async updateCompanyProfile(profileData) {
    try {
      const response = await api.put('/companies/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update company profile');
    }
  },

  // Upload company logo
  async uploadLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/companies/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload logo');
    }
  },

  // Get company preferences
  async getCompanyPreferences() {
    try {
      const response = await api.get('/companies/preferences');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch preferences');
    }
  },

  // Update company preferences
  async updateCompanyPreferences(preferences) {
    try {
      const response = await api.put('/companies/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Enable/disable two-factor authentication
  async updateTwoFactorAuth(enabled) {
    try {
      const response = await api.put('/auth/2fa', { enabled });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update 2FA settings');
    }
  },

  // Delete company account
  async deleteCompanyAccount() {
    try {
      const response = await api.delete('/companies/account');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },

  // Get company statistics
  async getCompanyStats() {
    try {
      const response = await api.get('/companies/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch company statistics');
    }
  },

  // Mock data for development
  getMockCompanyProfile() {
    return {
      id: '1',
      name: 'TechFlow Inc.',
      description: 'Leading technology company focused on innovation and digital transformation.',
      website: 'https://techflow.com',
      logo: null,
      industry: 'Technology',
      size: '50-200',
      location: 'San Francisco, CA',
      foundedYear: 2020,
      verified: true,
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    };
  },

  getMockPreferences() {
    return {
      emailNotifications: true,
      jobAlerts: true,
      marketingEmails: false,
      autoPostJobs: false,
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles'
    };
  },

  getMockStats() {
    return {
      totalJobs: 12,
      activeJobs: 8,
      totalApplications: 156,
      pendingApplications: 23,
      viewsThisMonth: 1247,
      averageResponseTime: '2.3 days'
    };
  }
}; 