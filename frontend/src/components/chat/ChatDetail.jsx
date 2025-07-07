import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { chatService } from "../../services/chatService";
import { useAuth } from "../../contexts/AuthContext";
import { Send, Paperclip, MoreVertical } from "lucide-react";
import { subscribeToPusherChannel, unsubscribeFromPusherChannel } from "../../config/pusher";

const ChatDetail = () => {
  const { chatId } = useParams();
  const { userData } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch chat messages and participants
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setLoading(true);
        const [messagesResponse, participantsResponse] = await Promise.all([
          chatService.getChatMessages(chatId),
          chatService.getChatParticipants(chatId),
        ]);

        if (messagesResponse.success === false) {
          throw new Error(messagesResponse.message || "Failed to load messages");
        }
        
        if (participantsResponse.success === false) {
          throw new Error(participantsResponse.message || "Failed to load participants");
        }

        // The backend returns the data directly, not nested under a data property
        setMessages(messagesResponse.messages || []);
        setParticipants(participantsResponse.participants || []);
        setError(null);

        // Mark messages as read
        await chatService.markMessagesAsRead(chatId);
      } catch (err) {
        setError("Failed to load chat data. Please try again later.");
        console.error("Error fetching chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChatData();
    }
  }, [chatId]);

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!chatId) return;
    
    // Subscribe to chat channel for new messages
    const channel = subscribeToPusherChannel(
      `chat-${chatId}`,
      'new-message',
      (newMessage) => {
        // Only add the message if it's not from the current user
        if (newMessage.senderId !== userData?.id) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          // Mark message as read
          chatService.markMessagesAsRead(chatId).catch(console.error);
        }
      }
    );
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribeFromPusherChannel(`chat-${chatId}`);
    };
  }, [chatId, userData?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !chatId) return;

    try {
      const response = await chatService.sendMessage(
        chatId,
        newMessage,
        file
      );
      
      if (response.success === false) {
        throw new Error(response.message || "Failed to send message");
      }
      
      // The backend returns the message directly, not nested under a data property
      // We add the message to our local state immediately for a responsive UI
      // The message will also come through the Pusher channel, but we've already added it
      setMessages((prevMessages) => [...prevMessages, response.message || response]);
      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isCurrentUser = (senderId) => {
    const currentUserId = userData?.id;
    console.log("Current user ID:", currentUserId, "Sender ID:", senderId);
    return senderId === currentUserId;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading chat...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0">
            {/* Avatar would go here */}
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium">
              {chat?.name || "Chat"}
            </h2>
            <p className="text-sm text-gray-500">
              {participants.length} participants
            </p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isMine = isCurrentUser(message.senderId);
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-medium mb-1">
                      {message.sender.firstName} {message.sender.lastName}
                    </p>
                  )}
                  {message.type === "TEXT" && <p>{message.content}</p>}
                  {message.type === "IMAGE" && (
                    <img
                      src={message.fileUrl}
                      alt="Shared image"
                      className="rounded max-w-full"
                    />
                  )}
                  {message.type === "FILE" && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-100 underline"
                    >
                      📎 {message.fileName || "Attachment"}
                    </a>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(message.createdAt)}
                    {message.edited && " (edited)"}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex items-center"
      >
        <button
          type="button"
          onClick={triggerFileInput}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {file && (
          <div className="ml-2 text-sm text-gray-600 flex-1">
            File: {file.name}
            <button
              type="button"
              onClick={() => setFile(null)}
              className="ml-2 text-red-500"
            >
              ✕
            </button>
          </div>
        )}
        {!file && (
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          type="submit"
          disabled={!newMessage.trim() && !file}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatDetail;