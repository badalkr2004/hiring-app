import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { authService } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

const NewDirectChat = ({ onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userData } = useAuth();

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 2) {
      setLoading(true);
      try {
        // Get all users and filter by search query
        const response = await authService.getAllUsers();
        console.log(response.data.users);
        if (response.success === false) {
          throw new Error(response.message || "Failed to get users");
        }
        console.log(userData, "userData");
        // The backend returns the users under data.users
        const allUsers = response.data?.users || [];
        console.log(allUsers, "allUsers");
        const filteredUsers = allUsers.filter(
          (user) =>
            // Filter out the current user and match search query
            user.id !== userData?.id &&
            (`${user.firstName} ${user.lastName}`
              .toLowerCase()
              .includes(query.toLowerCase()) ||
              user.email.toLowerCase().includes(query.toLowerCase()))
        );
        console.log("filteredUsers:", filteredUsers);
        setSearchResults(filteredUsers);
        setError(null);
      } catch (err) {
        setError("Failed to search users");
        console.error("Error searching users:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleStartChat = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await chatService.createDirectChat(selectedUser.id);

      if (response.success === false) {
        throw new Error(response.message || "Failed to create chat");
      }

      onClose();
      // The backend returns the chat object directly, not nested under a data property
      navigate(`/chat/${response.id}`);
    } catch (err) {
      setError("Failed to create chat");
      console.error("Error creating chat:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label
          htmlFor="search-users"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Search for a user
        </label>
        <input
          id="search-users"
          type="text"
          placeholder="Type a name..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {loading && <div className="text-center py-4">Searching...</div>}

      {error && <div className="text-red-500 text-center py-2">{error}</div>}

      {!loading &&
        searchResults.length === 0 &&
        searchQuery.trim().length > 2 && (
          <div className="text-center py-4 text-gray-500">
            No users found matching "{searchQuery}"
          </div>
        )}

      {searchResults.length > 0 && (
        <div className="mb-4 max-h-60 overflow-y-auto border rounded-md">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                selectedUser?.id === user.id ? "bg-blue-50" : ""
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              {selectedUser?.id === user.id && (
                <div className="ml-auto">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onClose}
          className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleStartChat}
          disabled={!selectedUser || loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Start Chat
        </button>
      </div>
    </div>
  );
};

export default NewDirectChat;
