import { useState, useEffect } from "react";
import { api } from "../../libs/apis";
import { User } from "lucide-react";

const ChatList = ({ selectedChatId, onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get("/messages/chats");
      const chatData = Array.isArray(response.data) ? response.data : [];
      setChats(chatData);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600 mx-auto mb-3"></div>
          <div className="text-purple-600 text-sm">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-purple-100 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="text-purple-100 text-sm">
              {chats.length} conversations
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-purple-50">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50/50"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!chats || chats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-purple-500 font-medium">No conversations yet</p>
            <p className="text-purple-400 text-sm mt-1">
              Start chatting to see conversations here
            </p>
          </div>
        ) : (
          chats
            .map((chat) => {
              const participants = chat.participants || [];
              const participant =
                participants.length > 0 ? participants[0]?.user : null;
              const messages = chat.messages || [];
              const lastMessage = messages.length > 0 ? messages[0] : null;

              if (!participant) {
                return null;
              }

              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`flex items-center p-4 cursor-pointer transition-all duration-200 border-b border-purple-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 ${
                    selectedChatId === chat.id
                      ? "bg-gradient-to-r from-purple-100 to-blue-100 border-l-4 border-l-purple-500"
                      : ""
                  }`}
                >
                  <div className="relative">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200"
                      />
                    ) : (
                      <User className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200" />
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white"></div>
                  </div>

                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {participant.firstName || "Unknown"}{" "}
                        {participant.lastName || "User"}
                      </h3>
                      {lastMessage && lastMessage.createdAt && (
                        <span className="text-xs text-purple-500 ml-2 font-medium">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 truncate mt-1">
                      {lastMessage?.content || "Start a conversation"}
                    </p>
                  </div>

                  {selectedChatId === chat.id && (
                    <div className="ml-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })
            .filter(Boolean)
        )}
      </div>
    </div>
  );
};

export default ChatList;
