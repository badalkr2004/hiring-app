// src/components/chat/ChatItem.jsx
import React from "react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../../contexts/AuthContext";

const ChatItem = ({ chat, isActive, onClick, unreadCount = 0 }) => {
  const { userData } = useAuth();
  const currentUserId = userData?.id;

  // For direct chats, find the other participant
  const otherParticipant =
    chat.type === "DIRECT"
      ? chat.participants.find((p) => p.user.id !== currentUserId)?.user
      : null;

  const chatName =
    chat.type === "DIRECT"
      ? `${otherParticipant?.firstName} ${otherParticipant?.lastName}`
      : chat.name;

  const lastMessage =
    chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;

  const lastMessageTime = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
    : "";

  return (
    <div
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
        isActive ? "bg-indigo-50" : ""
      }`}
      onClick={() => onClick(chat.id)}
    >
      <Avatar
        src={chat.type === "DIRECT" ? otherParticipant?.avatar : chat.avatar}
        alt={chatName}
        online={
          otherParticipant?.lastLogin &&
          new Date(otherParticipant.lastLogin).getTime() > Date.now() - 300000
        }
      />

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-900 truncate">
            {chatName}
          </p>
          <span className="text-xs text-gray-500">{lastMessageTime}</span>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 truncate">
            {lastMessage ? (
              <>
                {lastMessage.sender?.id === currentUserId
                  ? "You: "
                  : `${lastMessage.sender?.firstName}: `}
                {lastMessage.content}
              </>
            ) : (
              "No messages yet"
            )}
          </p>
          {unreadCount > 0 && (
            <Badge count={unreadCount} variant="primary" size="sm" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
