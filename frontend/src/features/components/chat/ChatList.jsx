// src/components/chat/ChatList.jsx
import React, { useEffect } from "react";
import ChatItem from "./ChatItem";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../../contexts/AuthContext";

const ChatList = () => {
  const {
    chats,
    currentChat,
    selectChat,
    unreadCounts,
    loading,
    userId,
    fetchChats,
  } = useChat();
  console.log("loaidng chats:", chats);
  const { userData } = useAuth();

  // Re-fetch chats when the component mounts to ensure fresh data
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Create a map to deduplicate chats by user
  const userChats = new Map();

  // Group chats by the other participant's ID
  chats.forEach((chat) => {
    if (chat.type === "DIRECT") {
      const otherParticipant = chat.participants.find(
        (p) => p.user.id !== userData?.id
      )?.user;

      if (otherParticipant) {
        // If we already have a chat with this user, only keep the newest one
        if (
          !userChats.has(otherParticipant.id) ||
          new Date(chat.updatedAt) >
            new Date(userChats.get(otherParticipant.id).updatedAt)
        ) {
          userChats.set(otherParticipant.id, chat);
        }
      }
    } else {
      // For group chats, just use the chat ID as the key
      userChats.set(chat.id, chat);
    }
  });

  // Convert the map back to an array and sort by updatedAt
  const uniqueChats = Array.from(userChats.values()).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  if (loading && uniqueChats.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (uniqueChats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {uniqueChats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={{ ...chat, currentUserId: userData?.id }}
          isActive={currentChat?.id === chat.id}
          onClick={selectChat}
          unreadCount={unreadCounts[chat.id] || 0}
        />
      ))}
    </div>
  );
};

export default ChatList;
