// components/chat/NewChatButton.jsx
import React, { useState } from "react";
import Button from "../ui/Button";
import { useChat } from "../../context/ChatContext";

const NewChatButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { createDirectChat } = useChat();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);

    try {
      // This is a mock function - you'd need to implement the actual API call
      // to search for users in your system
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId) => {
    const chat = await createDirectChat(userId);
    if (chat) {
      setShowModal(false);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="w-full">
        New Conversation
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Start a new conversation
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a user..."
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Button
                  onClick={handleSearch}
                  variant="primary"
                  className="rounded-l-none"
                  disabled={isSearching || !searchTerm.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {searchResults.length === 0 && searchTerm && !isSearching && (
                <p className="text-center text-gray-500 py-4">No users found</p>
              )}

              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => handleStartChat(user.id)}
                >
                  <div className="flex items-center">
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChatButton;
