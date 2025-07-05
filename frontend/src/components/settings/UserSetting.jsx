import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userSettingsService } from '../../services/userSettingsService';

const UserSettings = () => {
    const { userData, setUserData, accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
        skills: '',
        experience: '',
        education: '',
        linkedin: '',
        github: '',
        portfolio: ''
    });

    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification preferences
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        jobAlerts: true,
        applicationUpdates: true,
        marketingEmails: false,
        weeklyDigest: true
    });

    // Resume upload state
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeUrl, setResumeUrl] = useState('');
    
    // Avatar upload state
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (userData) {
            setProfileForm({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                phone: userData.phone || '',
                location: userData.location || '',
                bio: userData.bio || '',
                skills: userData.skills ? userData.skills.join(', ') : '',
                experience: userData.experience || '',
                education: userData.education || '',
                linkedin: userData.linkedin || '',
                github: userData.github || '',
                portfolio: userData.portfolio || ''
            });
            setResumeUrl(userData.resumeUrl || '');
            setAvatarUrl(userData.avatarUrl || '');
        }
    }, [userData]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updateData = {
                ...profileForm,
                skills: profileForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
            };

            const response = await userSettingsService.updateProfile(updateData, accessToken);

            if (response.success) {
                setUserData({ ...userData, ...response.data.user });
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await userSettingsService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, accessToken);

            if (response.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        e.preventDefault();
        if (!resumeFile) {
            setMessage({ type: 'error', text: 'Please select a file to upload' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userSettingsService.uploadResume(resumeFile, accessToken);

            if (response.success) {
                setResumeUrl(response.data.resumeUrl);
                setUserData({ ...userData, resumeUrl: response.data.resumeUrl });
                setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
                setResumeFile(null);
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload resume' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userSettingsService.updateNotifications(notifications, accessToken);

            if (response.success) {
                setMessage({ type: 'success', text: 'Notification preferences updated!' });
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update notifications' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            setMessage({ type: 'error', text: 'Please select an image to upload' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userSettingsService.uploadAvatar(avatarFile, accessToken);

            if (response.success) {
                setAvatarUrl(response.data.avatarUrl);
                setUserData({ ...userData, avatarUrl: response.data.avatarUrl });
                setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
                setAvatarFile(null);
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload avatar' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDataDownload = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userSettingsService.downloadUserData(accessToken);

            if (response.success) {
                // Create and download file
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'user-data.json';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setMessage({ type: 'success', text: 'Data downloaded successfully!' });
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download data' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccountDeletion = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await userSettingsService.deleteAccount(accessToken);

            if (response.success) {
                // Redirect to logout or home page
                window.location.href = '/';
            } else {
                setMessage({ type: 'error', text: response.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete account' });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'resume', name: 'Resume', icon: '📄' },
        { id: 'password', name: 'Password', icon: '🔒' },
        { id: 'account', name: 'Account', icon: '⚙️' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Account Settings
                    </h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Manage your profile, resume, and account preferences to make the most of your job search experience
                    </p>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl shadow-lg border-l-4 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-800 border-green-400' 
                            : message.type === 'error' 
                                ? 'bg-red-50 text-red-800 border-red-400' 
                                : 'bg-blue-50 text-blue-800 border-blue-400'
                    }`}>
                        <div className="flex items-center">
                            <span className="text-xl mr-3">
                                {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
                            </span>
                            {message.text}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <nav className="flex space-x-1 p-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-md border border-gray-200'
                                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="mr-2 text-lg">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                {/* Avatar Upload Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                        <span className="mr-3 text-2xl">📸</span>
                                        Profile Picture
                                    </h3>
                                    <div className="flex items-center space-x-8">
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden shadow-lg border-4 border-white">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-3xl">👤</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <form onSubmit={handleAvatarUpload} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                        Upload Profile Picture
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => setAvatarFile(e.target.files[0])}
                                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors duration-200"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={!avatarFile || isLoading}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    {isLoading ? 'Uploading...' : 'Upload Avatar'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Form */}
                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">First Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.firstName}
                                                onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                                            <input
                                                type="text"
                                                value={profileForm.lastName}
                                                onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Phone</label>
                                            <input
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Location</label>
                                            <input
                                                type="text"
                                                value={profileForm.location}
                                                onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                placeholder="City, State"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Experience</label>
                                            <input
                                                type="text"
                                                value={profileForm.experience}
                                                onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                placeholder="e.g., 5 years"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Bio</label>
                                        <textarea
                                            value={profileForm.bio}
                                            onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Skills (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={profileForm.skills}
                                            onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                            placeholder="React, TypeScript, Node.js"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Education</label>
                                        <textarea
                                            value={profileForm.education}
                                            onChange={(e) => setProfileForm({...profileForm, education: e.target.value})}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                                            placeholder="Your educational background..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">LinkedIn</label>
                                            <input
                                                type="url"
                                                value={profileForm.linkedin}
                                                onChange={(e) => setProfileForm({...profileForm, linkedin: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">GitHub</label>
                                            <input
                                                type="url"
                                                value={profileForm.github}
                                                onChange={(e) => setProfileForm({...profileForm, github: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Portfolio</label>
                                            <input
                                                type="url"
                                                value={profileForm.portfolio}
                                                onChange={(e) => setProfileForm({...profileForm, portfolio: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                                placeholder="https://yourportfolio.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                                        >
                                            {isLoading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Resume Tab */}
                        {activeTab === 'resume' && (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                        <span className="mr-3 text-2xl">📄</span>
                                        Resume Upload
                                    </h3>
                                    
                                    {resumeUrl && (
                                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <p className="text-green-800 flex items-center">
                                                <span className="mr-2">✅</span>
                                                <strong>Current Resume:</strong> 
                                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline font-medium">
                                                    View Resume
                                                </a>
                                            </p>
                                        </div>
                                    )}

                                    <form onSubmit={handleResumeUpload} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Upload Resume (PDF, DOC, DOCX)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 transition-colors duration-200"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!resumeFile || isLoading}
                                            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            {isLoading ? 'Uploading...' : 'Upload Resume'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 mb-8">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                        <span className="mr-3 text-2xl">🔒</span>
                                        Change Password
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Update your password to keep your account secure. Make sure to use a strong password with a mix of letters, numbers, and symbols.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                                        >
                                            {isLoading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}


                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                        <span className="mr-3 text-2xl">⚙️</span>
                                        Account Management
                                    </h3>
                                    <p className="text-gray-600">
                                        Manage your account settings and data. Be careful with these actions as they cannot be undone.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center mb-4">
                                            <span className="text-2xl mr-3">📥</span>
                                            <h4 className="text-lg font-semibold text-gray-900">Download Your Data</h4>
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Download a copy of your personal data including profile information and application history.
                                        </p>
                                        <button 
                                            onClick={handleDataDownload}
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            {isLoading ? 'Downloading...' : 'Download Data'}
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center mb-4">
                                            <span className="text-2xl mr-3">🗑️</span>
                                            <h4 className="text-lg font-semibold text-red-900">Delete Account</h4>
                                        </div>
                                        <p className="text-red-700 mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={handleAccountDeletion}
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            {isLoading ? 'Deleting...' : 'Delete Account'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;