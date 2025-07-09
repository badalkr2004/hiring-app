// components/chat/ChatMessages.jsx
import React, { useEffect, useRef } from "react";
import Message from "./Message";
import { useChat } from "../../context/ChatContext";

const ChatMessages = () => {
  const { messages, currentChat, loading, userId } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <div className="flex max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="mx-2 p-3 rounded-lg bg-gray-200 w-60">
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm mt-1">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === userId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
