import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../libs/apis";
import { useAuth } from "../../contexts/AuthContext";
import ChatWindow from "../chat/chatWindow";
import { getPusher } from "../../libs/pusher";
import { User } from "lucide-react";

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchCommunityDetails();
    subscribeToUpdates();
  }, [id]);

  const fetchCommunityDetails = async () => {
    try {
      const response = await api.get(`/connects/communities/${id}`);
      setCommunity(response.data);
      setMembers(response.data.members);
    } catch (error) {
      console.error("Error fetching community:", error);
      navigate("/communities");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    const pusher = getPusher();
    const channel = pusher.subscribe(`community-${id}`);

    channel.bind("member:joined", () => {
      fetchCommunityDetails();
    });

    channel.bind("member:left", () => {
      fetchCommunityDetails();
    });

    return () => {
      pusher.unsubscribe(`community-${id}`);
    };
  };

  const handleJoinCommunity = async () => {
    try {
      await api.post(`/communities/${id}/join`);
      fetchCommunityDetails();
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await api.post(`/communities/${id}/leave`);
      fetchCommunityDetails();
    } catch (error) {
      console.error("Error leaving community:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <div className="text-purple-600 font-medium">
            Loading community...
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Community not found
          </h3>
          <p className="text-gray-500">
            The community you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const isMemb = community.userMember;
  const communityChat = community.chats.find((c) => c.type === "COMMUNITY");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {community.avatar ?<img
                src={community.avatar}
                alt={community.name}
                className="w-16 h-16 rounded-full border-4 border-purple-200"
              /> : <User className="w-16 h-16 rounded-full border-4 border-purple-200"/>}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {community.name}
                </h1>
                <p className="text-purple-600">{community.category}</p>
                <p className="text-sm text-gray-500">
                  {community.memberCount} members
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isMemb ? (
                <button
                  onClick={handleJoinCommunity}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Join Community
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 capitalize font font-bold">
                    {isMemb.role.toLowerCase().replace("_", " ")}
                  </span>
                  {isMemb.role !== "CREATOR" && (
                    <button
                      onClick={handleLeaveCommunity}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    >
                      Leave
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-700">{community.description}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-6 border-b border-purple-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("chat")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "chat"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "members"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Members ({community.memberCount})
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "chat" && (
          <div className="bg-white rounded-xl shadow-lg h-96">
            {isMemb && communityChat ? (
              <ChatWindow chatId={communityChat.id} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">🔒</div>
                  <p className="text-gray-500">
                    Join the community to participate in discussions
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg"
                >
                  <img
                    src={member.user.avatar || "/default-avatar.png"}
                    alt={`${member.user.firstName} ${member.user.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </h3>
                    <p className="text-sm text-purple-600">
                      {member.role.toLowerCase()}
                    </p>
                    {member.user.skills && member.user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.user.skills.slice(0, 2).map((skill, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.user.skills.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{member.user.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
