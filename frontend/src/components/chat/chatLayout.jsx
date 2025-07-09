import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./chatWindow";
import { useAuth } from "../../contexts/AuthContext";
import { initializePusher } from "../../libs/pusher";
import { useParams } from "react-router-dom";

const ChatApp = () => {
  const [selectedChatId, setSelectedChatId] = useState();
  const { chatId } = useParams();
  const { userData, loading } = useAuth();

  useEffect(() => {
    if (userData) {
      initializePusher();
      setSelectedChatId(chatId);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <div className="text-purple-600 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-violet-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-2xl border border-purple-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Please login to continue
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the chat feature.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-purple-50 via-blue-50 to-violet-50">
      <ChatList
        selectedChatId={selectedChatId}
        onChatSelect={setSelectedChatId}
      />
      <ChatWindow chatId={selectedChatId} />
    </div>
  );
};

export default ChatApp;
