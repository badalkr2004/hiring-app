import React, { useState } from "react";
import { api } from "../../libs/apis";
import { useNavigate } from "react-router-dom";

const ChatButton = ({ text, applicationId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await api.post(`/messages/chats/${applicationId}`);
      const chatId = response.data.id;
      console.log("chatid", chatId);
      navigate(`/message?chatId=${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleOpenChat}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all ${
        loading
          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
      title="Open chat"
      type="button"
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4-4.03 7-9 7a9.77 9.77 0 01-4-.8L3 20l1.8-3.6A7.94 7.94 0 013 12c0-4 4.03-7 9-7s9 3 9 7z"
          />
        </svg>
      )}
      {loading ? "Opening..." : text}
    </button>
  );
};

export default ChatButton;
