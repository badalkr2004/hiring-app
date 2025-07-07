import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatList from "../components/chat/ChatList";
import ChatDetail from "../components/chat/ChatDetail";
import NewDirectChat from "../components/chat/NewDirectChat";
import { Plus, ArrowLeft } from "lucide-react";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const handleStartNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleCloseModal = () => {
    setShowNewChatModal(false);
  };

  // No longer needed as NewDirectChat component handles this functionality

  return (
    <div className="h-full flex">
      {/* Chat list sidebar */}
      <div
        className={`border-r w-80 flex-shrink-0 flex flex-col ${
          chatId && "hidden md:flex"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={handleStartNewChat}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
      </div>

      {/* Chat detail or empty state */}
      <div className="flex-1 flex flex-col">
        {chatId ? (
          <>
            <div className="md:hidden p-2 border-b">
              <button
                onClick={() => navigate("/chat")}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="flex-1">
              <ChatDetail />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center text-gray-500">
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium">No chat selected</h3>
              <p className="mt-1 text-sm">
                Select a chat from the sidebar or start a new conversation.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">New Message</h3>
            </div>
            <NewDirectChat onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;