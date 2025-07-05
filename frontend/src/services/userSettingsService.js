import { api } from '../libs/apis';

export const userSettingsService = {
    // Update user profile
    async updateProfile(profileData, token) {
        return await api.put('/users/profile', profileData, { token });
    },

    // Change password
    async changePassword(passwordData, token) {
        return await api.put('/users/password', passwordData, { token });
    },

    // Upload resume
    async uploadResume(file, token) {
        const formData = new FormData();
        formData.append('resume', file);
        
        return await api.post('/users/resume', formData, { 
            token,
            headers: {} // Let browser set content-type for FormData
        });
    },

    // Update notification preferences
    async updateNotifications(notifications, token) {
        return await api.put('/users/notifications', notifications, { token });
    },

    // Download user data
    async downloadUserData(token) {
        return await api.get('/users/data', { token });
    },

    // Delete account
    async deleteAccount(token) {
        return await api.delete('/users/account', { token });
    },

    // Get user profile
    async getUserProfile(token) {
        return await api.get('/users/profile', { token });
    },

    // Update user avatar
    async updateAvatar(file, token) {
        const formData = new FormData();
        formData.append('avatar', file);
        
        return await api.post('/users/avatar', formData, { 
            token,
            headers: {} // Let browser set content-type for FormData
        });
    },

    // Export application history
    async exportApplicationHistory(token) {
        return await api.get('/users/applications/export', { token });
    },

    // Get account activity
    async getAccountActivity(token) {
        return await api.get('/users/activity', { token });
    }
}; 