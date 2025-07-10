import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../libs/apis";
import { useAuth } from "../../contexts/AuthContext";

const CommunityList = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
  });

  const { userData } = useAuth();

  useEffect(() => {
    fetchCommunities();
  }, [filters]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/connects/communities?${params}`);
      console.log(response.data);
      setCommunities(response.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await api.post(`/connects/communities/${communityId}/join`);
      fetchCommunities(); // Refresh list
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Tech Communities
          </h1>
          <p className="text-purple-600 text-lg">
            Connect, learn, and grow with tech professionals
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search communities..."
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="DevOps">DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Community Button */}
        <div className="text-center mb-8">
          <Link
            to="/communities/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Community
          </Link>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <div
                key={community.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {community.banner && (
                  <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500 relative">
                    <img
                      src={community.banner}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={community.avatar || "/default-community.png"}
                      alt={community.name}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {community.name}
                      </h3>
                      <p className="text-sm text-purple-600">
                        {community.category}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {community.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {community._count.members} members
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        community.type === "PUBLIC"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {community.type.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/communities/${community.id}`}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg text-center font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                    >
                      View
                    </Link>
                    {!community.members.some(
                      (m) => m.userId === userData?.id
                    ) && (
                      <button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="bg-white border border-purple-500 text-purple-500 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
