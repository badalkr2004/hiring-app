// components/chat/Message.jsx
import React, { useState } from "react";
import Avatar from "../ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { useChat } from "../../context/ChatContext";

const Message = ({ message, isCurrentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showOptions, setShowOptions] = useState(false);

  const { editMessage, deleteMessage } = useChat();

  const handleEdit = async () => {
    await editMessage(message.id, editedContent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(message.id);
    }
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="mt-1">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
          />
          <div className="flex space-x-2 mt-1">
            <button
              onClick={handleEdit}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    switch (message.type) {
      case "IMAGE":
        return (
          <div className="mt-1">
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-xs rounded-md max-h-60 object-contain"
            />
            {message.content && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        );
      case "FILE":
        return (
          <div className="mt-1">
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{message.fileName || "Attached file"}</span>
            </a>
            {message.content && (
              <p className="text-sm mt-1">{message.content}</p>
            )}
          </div>
        );
      default:
        return <p className="text-sm mt-1">{message.content}</p>;
    }
  };

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div
        className={`flex ${
          isCurrentUser ? "flex-row-reverse" : "flex-row"
        } max-w-[80%]`}
      >
        <Avatar
          src={message.sender.avatar}
          alt={`${message.sender.firstName} ${message.sender.lastName}`}
          size="sm"
        />

        <div
          className={`mx-2 p-3 rounded-lg ${
            isCurrentUser
              ? "bg-indigo-100 text-gray-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">
              {isCurrentUser
                ? "You"
                : `${message.sender.firstName} ${message.sender.lastName}`}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {renderMessageContent()}

          {message.edited && !isEditing && (
            <span className="text-xs text-gray-500 block mt-1">(edited)</span>
          )}
        </div>

        {isCurrentUser && showOptions && !isEditing && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-600 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
