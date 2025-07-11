import { useState, useEffect, useRef } from "react";
import api from "./api";
import { useAuth } from "../../contexts/AuthContext";
import { getPusher } from "../../libs/pusher";
import { Send } from "lucide-react";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { userData } = useAuth();

  // Track optimistic messages to prevent duplicates
  const optimisticMessagesRef = useRef(new Set());

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      subscribeToMessages();
    }

    return () => {
      const pusher = getPusher();
      pusher.unsubscribe(`private-chat-${chatId}`);
      // Clear optimistic messages when chat changes
      optimisticMessagesRef.current.clear();
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/chats/${chatId}/messages`);
      setMessages(response.data.data || []);
      // Clear optimistic messages when fetching fresh data
      optimisticMessagesRef.current.clear();
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const pusher = getPusher();
    const channel = pusher.subscribe(`private-chat-${chatId}`);

    channel.bind("message:new", (message) => {
      // Check if this message was sent optimistically by current user
      const tempId = `temp-${message.content}-${userData?.id}`;

      if (optimisticMessagesRef.current.has(tempId)) {
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...message, id: message.id } : msg
          )
        );
        optimisticMessagesRef.current.delete(tempId);
      } else {
        // Add new message from other users
        setMessages((prev) => {
          // Prevent duplicate messages
          const messageExists = prev.some((msg) => msg.id === message.id);
          if (messageExists) return prev;

          return [...prev, message];
        });
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${messageContent}-${userData?.id}`;

    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      senderId: userData?.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // Flag to identify optimistic messages
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    optimisticMessagesRef.current.add(tempId);

    // Clear input
    setNewMessage("");
    setSending(true);

    try {
      const response = await api.post(`/messages/chats/${chatId}/messages`, {
        content: messageContent,
      });

      // Replace optimistic message with real message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...response.data, isOptimistic: false } : msg
        )
      );

      optimisticMessagesRef.current.delete(tempId);
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove failed optimistic message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      optimisticMessagesRef.current.delete(tempId);

      // Restore message in input for retry
      setNewMessage(messageContent);

      // You could show an error toast here
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-medium">C</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Chat</h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
              <div className="text-gray-600 text-sm">Loading messages...</div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, idx) => {
              const isOwn = message.senderId === userData?.id;
              const isOptimistic = message.isOptimistic;

              return (
                <div
                  key={`${message.id}-${idx}`}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                      isOwn
                        ? `${
                            isOptimistic
                              ? "bg-blue-400 text-white opacity-70"
                              : "bg-blue-500 text-white"
                          }`
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-xs ${
                          isOwn ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                      {isOptimistic && (
                        <div className="ml-2">
                          <svg
                            className="w-3 h-3 text-blue-200 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !newMessage.trim() || sending
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {sending ? (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
