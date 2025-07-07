import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../libs/apis";
import {
  User,
  Edit3,
  Save,
  X,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Link,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
} from "lucide-react";

const AdminUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    skills: [],
    experience: "",
    bio: "",
    education: "",
    linkedIn: "",
    github: "",
    portfolio: "",
    avatar: "",
    resume: "",
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.put(`/users/profile/${userId}`);
        setUser(response.data.user);
        setFormData(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/profile/${userId}`, formData);
      if (response.success) {
        setUser(response.data.user);
        setEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(response.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Users</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-slate-600 text-lg mt-1">
                  {editing ? "Editing Profile" : "User Profile"}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Edit3 className="h-5 w-5" />
                <span className="font-medium">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-slate-600 mt-1">{user?.email}</p>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user?.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-4">
                {user?.phone && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.role && (
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(user?.linkedIn || user?.github || user?.portfolio) && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">
                    Social Links
                  </h4>
                  <div className="space-y-3">
                    {user?.linkedIn && (
                      <a
                        href={user.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-slate-600 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {user?.github && (
                      <a
                        href={user.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                      >
                        <Github className="h-5 w-5" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {user?.portfolio && (
                      <a
                        href={user.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
                      >
                        <Globe className="h-5 w-5" />
                        <span>Portfolio</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              {editing ? (
                <form onSubmit={handleFormSubmit} className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Edit Profile
                    </h2>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Fields */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Skills
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills?.join(", ") || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            skills: e.target.value
                              .split(",")
                              .map((skill) => skill.trim()),
                          }))
                        }
                        placeholder="JavaScript, React, Node.js"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio || ""}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        GitHub
                      </label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Profile Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-600">Full Name</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Email</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {user?.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Phone</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {user?.phone || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Location</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {user?.location || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Professional Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-600">Skills</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {user?.skills?.length > 0 ? (
                                user.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-500">
                                  No skills listed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {user?.bio && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Bio
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;
