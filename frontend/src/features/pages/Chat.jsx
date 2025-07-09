// src/pages/Chat.jsx
import React from "react";
import { ChatProvider } from "../context/ChatContext";
import ChatContainer from "../components/chat/ChatContainer";

const Chat = () => {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-64px)]">
      <ChatContainer />
    </div>
  );
};

export default Chat;
