import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../contexts/AuthContext";
import { subscribeToPusherChannel, unsubscribeFromPusherChannel } from "../../config/pusher";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await chatService.getUserChats();
        
        if (response.success === false) {
          throw new Error(response.message || "Failed to load chats");
        }
        
        // The backend returns the chats directly, not nested under a data property
        setChats(response.chats || []);
        setError(null);
      } catch (err) {
        setError("Failed to load chats. Please try again later.");
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Subscribe to user-specific channel for chat updates
    if (userData?.id) {
      const channel = subscribeToPusherChannel(
        `user-${userData.id}`,
        'new-message-notification',
        (data) => {
          // Update the chat list when a new message is received
          fetchChats();
        }
      );

      // Cleanup function to unsubscribe when component unmounts
      return () => {
        unsubscribeFromPusherChannel(`user-${userData.id}`);
      };
    }
  }, [userData?.id]);

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">You don't have any chats yet.</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("/users")}
        >
          Find someone to chat with
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {chats.map((chat) => {
        // For direct chats, find the other participant
        const otherParticipant =
          chat.type === "DIRECT" &&
          chat.participants.find(
            (p) => p.userId !== userData?.id
          )?.user;

        const lastMessage = chat.messages[0];

        return (
          <div
            key={chat.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0">
                {chat.type === "DIRECT" && otherParticipant?.avatar && (
                  <img
                    src={otherParticipant.avatar}
                    alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                {chat.type === "GROUP" && chat.avatar && (
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-baseline">
                  <h3 className="text-sm font-medium">
                    {chat.type === "DIRECT"
                      ? otherParticipant
                        ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                        : "Unknown User"
                      : chat.name}
                  </h3>
                  <span className="ml-auto text-xs text-gray-500">
                    {lastMessage &&
                      new Date(lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {lastMessage
                    ? lastMessage.type === "TEXT"
                      ? lastMessage.content
                      : lastMessage.type === "IMAGE"
                      ? "📷 Image"
                      : "📎 File"
                    : "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;