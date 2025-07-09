// src/components/chat/ChatHeader.jsx
import React from "react";
import Avatar from "../ui/Avatar";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../../contexts/AuthContext";

const ChatHeader = () => {
  const { currentChat } = useChat();
  const { userData } = useAuth();
  const userId = userData?.id;

  if (!currentChat) return null;

  // For direct chats, find the other participant
  const otherParticipant =
    currentChat.type === "DIRECT"
      ? currentChat.participants.find((p) => p.user.id !== userId)?.user
      : null;

  const chatName =
    currentChat.type === "DIRECT"
      ? `${otherParticipant?.firstName} ${otherParticipant?.lastName}`
      : currentChat.name;

  const isOnline =
    otherParticipant?.lastLogin &&
    new Date(otherParticipant.lastLogin).getTime() > Date.now() - 300000;

  return (
    <div className="flex-1 flex justify-between items-center">
      <div className="flex items-center">
        <Avatar
          src={
            currentChat.type === "DIRECT"
              ? otherParticipant?.avatar
              : currentChat.avatar
          }
          alt={chatName}
          online={isOnline}
        />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{chatName}</h3>
          {currentChat.type === "DIRECT" && (
            <p className="text-xs text-gray-500">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
