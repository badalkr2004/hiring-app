// components/chat/ChatContainer.jsx
import React from "react";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar with chat list */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>

      {/* Main chat area */}
      <div className="w-2/3 flex flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatMessages />
        </div>
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
