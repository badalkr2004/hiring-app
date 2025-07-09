import React from "react";
import { api } from "../../libs/apis";
import { useNavigate } from "react-router-dom";

const ChatButton = ({ text, applicationId }) => {
  const navigate = useNavigate();
  const handleOpenChat = async () => {
    try {
      const response = await api.post(`/messages/chats/${applicationId}`);
      const chatId = response.data.id;
      console.log("chatid", chatId);
      navigate(`/message?chatId=${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };
  return (
    <div>
      <button onClick={() => handleOpenChat()}>{text}</button>
    </div>
  );
};

export default ChatButton;
