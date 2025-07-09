// src/components/job/EmployerChat.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ChatProvider } from "../../context/ChatContext";
import { useChat } from "../../context/ChatContext";
import ChatHeader from "../chat/ChatHeader";
import ChatMessages from "../chat/ChatMessages";
import MessageInput from "../chat/MessageInput";
import { useAuth } from "../../../contexts/AuthContext";

// Create an inner component that uses the chat context
const EmployerChatContent = () => {
  const { jobId, employerId } = useParams();
  const navigate = useNavigate();
  const { selectChat, createDirectChat, loading, error, clearError } =
    useChat();
  const { isLoggedIn, isLoading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [initAttempted, setInitAttempted] = useState(false);
  const [invalidId, setInvalidId] = useState(false);

  useEffect(() => {
    // Validate employer ID format
    const isValidId = /^[0-9a-fA-F]{24}$/.test(employerId);
    if (!isValidId) {
      setInvalidId(true);
      setInitializing(false);
      return;
    }

    const initializeChat = async () => {
      // Only try once to prevent infinite loops
      if (initAttempted) return;

      try {
        setInitializing(true);
        setInitAttempted(true);

        // Create or get existing chat with the employer
        const chat = await createDirectChat(employerId);

        if (chat) {
          // Select the chat to load messages
          await selectChat(chat.id);
        }
      } catch (err) {
        console.error("Error initializing employer chat:", err);
      } finally {
        setInitializing(false);
      }
    };

    if (isLoggedIn && employerId && !initAttempted) {
      initializeChat();
    } else if (!isLoading) {
      setInitializing(false);
    }
  }, [
    employerId,
    createDirectChat,
    selectChat,
    isLoggedIn,
    isLoading,
    initAttempted,
  ]);

  if (isLoading || initializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (invalidId) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-center p-6 bg-red-50 border border-red-100 rounded-lg">
            <h3 className="text-lg text-red-700 font-medium mb-2">
              Invalid Employer ID
            </h3>
            <p className="text-red-600 mb-4">
              The employer ID in the URL is not in a valid format.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="text-center p-6 bg-red-50 border border-red-100 rounded-lg">
            <h3 className="text-lg text-red-700 font-medium mb-2">Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="h-[calc(100vh-64px)] flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center p-3 border-b border-gray-200">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <ChatHeader />
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatMessages />
        </div>

        <MessageInput />
      </div>
    </div>
  );
};

// Wrapper component that provides the chat context
const EmployerChat = () => {
  return (
    <ChatProvider>
      <EmployerChatContent />
    </ChatProvider>
  );
};

export default EmployerChat;
