// src/context/ChatContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { chatService } from "../services/chatService";
import { usePusher } from "../components/hooks/usePusher";
import { useAuth } from "../../contexts/AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { userData, isLoggedIn } = useAuth();
  const userId = userData?.id;

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Track API calls in progress
  const apiCallsInProgress = useRef({});
  // Track if component is mounted
  const isMounted = useRef(true);

  const { subscribeToChat, subscribeToUser } = usePusher(userId);

  // Clean function to prevent state updates after unmount
  const safeSetState = (setter, value) => {
    if (isMounted.current) {
      setter(value);
    }
  };

  // Fetch user's chats with deduplication
  const fetchChats = useCallback(async () => {
    if (!isLoggedIn || apiCallsInProgress.current.fetchChats) return;

    try {
      apiCallsInProgress.current.fetchChats = true;
      safeSetState(setLoading, true);

      const fetchedChats = await chatService.getUserChats();
      console.log("fetched chat", fetchedChats);

      // Deduplicate chats
      const uniqueChats = [];
      const chatIds = new Set();
      const userChats = new Map();

      fetchedChats.forEach((chat) => {
        if (!chatIds.has(chat.id)) {
          chatIds.add(chat.id);

          // For direct chats, group by participant
          if (chat.type === "DIRECT") {
            const otherParticipant = chat.participants.find(
              (p) => p.user.id !== userId
            )?.user;

            if (otherParticipant) {
              // Keep the newest chat with this user
              if (
                !userChats.has(otherParticipant.id) ||
                new Date(chat.updatedAt) >
                  new Date(userChats.get(otherParticipant.id).updatedAt)
              ) {
                userChats.set(otherParticipant.id, chat);
              }
            } else {
              uniqueChats.push(chat);
            }
          } else {
            // For group chats, just add them
            uniqueChats.push(chat);
          }
        }
      });

      // Add the unique direct chats
      userChats.forEach((chat) => {
        uniqueChats.push(chat);
      });

      // Sort by newest first
      uniqueChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      safeSetState(setChats, uniqueChats);
      safeSetState(setLoading, false);
    } catch (err) {
      safeSetState(setError, "Failed to load chats");
      safeSetState(setLoading, false);
      console.error(err);
    } finally {
      apiCallsInProgress.current.fetchChats = false;
    }
  }, [isLoggedIn, userId]);

  // Fetch messages for a chat
  const fetchMessages = useCallback(
    async (chatId) => {
      if (
        !chatId ||
        !isLoggedIn ||
        apiCallsInProgress.current[`fetchMessages_${chatId}`]
      )
        return;

      try {
        apiCallsInProgress.current[`fetchMessages_${chatId}`] = true;
        safeSetState(setLoading, true);

        const fetchedMessages = await chatService.getChatMessages(chatId);
        safeSetState(setMessages, fetchedMessages);

        // Mark messages as read
        await chatService.markMessagesAsRead(chatId);

        // Update unread counts
        safeSetState(setUnreadCounts, (prev) => ({
          ...prev,
          [chatId]: 0,
        }));

        safeSetState(setLoading, false);
      } catch (err) {
        safeSetState(setError, "Failed to load messages");
        safeSetState(setLoading, false);
        console.error(err);
      } finally {
        apiCallsInProgress.current[`fetchMessages_${chatId}`] = false;
      }
    },
    [isLoggedIn]
  );

  // Create a direct chat
  const createDirectChat = useCallback(
    async (participantId) => {
      if (
        !isLoggedIn ||
        !participantId ||
        apiCallsInProgress.current[`createDirectChat_${participantId}`]
      ) {
        return null;
      }

      // Validate participantId format
      if (!/^[0-9a-fA-F]{24}$/.test(participantId)) {
        safeSetState(setError, "Invalid participant ID format");
        return null;
      }

      try {
        apiCallsInProgress.current[`createDirectChat_${participantId}`] = true;

        // First, check if a chat already exists with this participant
        const existingChat = chats.find((chat) => {
          return (
            chat.type === "DIRECT" &&
            chat.participants.some((p) => p.user.id === participantId)
          );
        });

        if (existingChat) {
          return existingChat;
        }

        const newChat = await chatService.createDirectChat(participantId);

        // Check if this chat already exists in our state
        const chatExists = chats.some((chat) => chat.id === newChat.id);

        if (!chatExists) {
          safeSetState(setChats, (prev) => [newChat, ...prev]);
        }

        return newChat;
      } catch (err) {
        safeSetState(setError, "Failed to create chat");
        console.error(err);
        return null;
      } finally {
        apiCallsInProgress.current[`createDirectChat_${participantId}`] = false;
      }
    },
    [isLoggedIn, chats]
  );

  // Send a message
  const sendMessage = useCallback(
    async (chatId, content, file = null) => {
      if (!isLoggedIn || apiCallsInProgress.current[`sendMessage_${chatId}`])
        return null;

      try {
        apiCallsInProgress.current[`sendMessage_${chatId}`] = true;
        const newMessage = await chatService.sendMessage(chatId, content, file);

        safeSetState(setMessages, (prev) => [...prev, newMessage]);

        // Update chat in the list
        safeSetState(setChats, (prev) => {
          const updatedChats = prev.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [newMessage],
                updatedAt: new Date().toISOString(),
              };
            }
            return chat;
          });

          // Sort by newest first
          return updatedChats.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });

        return newMessage;
      } catch (err) {
        safeSetState(setError, "Failed to send message");
        console.error(err);
        return null;
      } finally {
        apiCallsInProgress.current[`sendMessage_${chatId}`] = false;
      }
    },
    [isLoggedIn]
  );

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!isLoggedIn) return false;

      try {
        await chatService.deleteMessage(messageId);
        safeSetState(setMessages, (prev) =>
          prev.filter((msg) => msg.id !== messageId)
        );
        return true;
      } catch (err) {
        safeSetState(setError, "Failed to delete message");
        console.error(err);
        return false;
      }
    },
    [isLoggedIn]
  );

  // Edit a message
  const editMessage = useCallback(
    async (messageId, content) => {
      if (!isLoggedIn) return null;

      try {
        const updatedMessage = await chatService.editMessage(
          messageId,
          content
        );
        safeSetState(setMessages, (prev) =>
          prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
        );
        return updatedMessage;
      } catch (err) {
        safeSetState(setError, "Failed to edit message");
        console.error(err);
        return null;
      }
    },
    [isLoggedIn]
  );

  // Select a chat
  const selectChat = useCallback(
    async (chatId) => {
      if (!chatId) return;

      const chat = chats.find((c) => c.id === chatId);
      safeSetState(setCurrentChat, chat);
      await fetchMessages(chatId);
    },
    [chats, fetchMessages]
  );

  // Clear error
  const clearError = useCallback(() => {
    safeSetState(setError, null);
  }, []);

  // Setup Pusher subscriptions for user notifications
  useEffect(() => {
    if (!userId || !isLoggedIn) return;

    const unsubscribeUser = subscribeToUser({
      "new-message-notification": (data) => {
        // Update unread count
        safeSetState(setUnreadCounts, (prev) => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || 0) + 1,
        }));

        // Update chat list
        safeSetState(setChats, (prev) => {
          const chatExists = prev.some((chat) => chat.id === data.chatId);

          if (chatExists) {
            const updatedChats = prev.map((chat) => {
              if (chat.id === data.chatId) {
                return {
                  ...chat,
                  messages: [data.message],
                  updatedAt: new Date().toISOString(),
                };
              }
              return chat;
            });

            return updatedChats.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          } else {
            // Fetch new chat but don't trigger infinite loop
            setTimeout(() => {
              if (isMounted.current && !apiCallsInProgress.current.fetchChats) {
                fetchChats();
              }
            }, 500);
            return prev;
          }
        });
      },
    });

    return () => {
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [userId, isLoggedIn, subscribeToUser, fetchChats]);

  // Subscribe to current chat
  useEffect(() => {
    if (!currentChat || !userId) return;

    const unsubscribe = subscribeToChat(currentChat.id, {
      "new-message": (data) => {
        if (data.senderId !== userId) {
          safeSetState(setMessages, (prev) => [...prev, data]);
          chatService.markMessagesAsRead(currentChat.id);
        }
      },
      "message-edited": (data) => {
        safeSetState(setMessages, (prev) =>
          prev.map((msg) => (msg.id === data.id ? data : msg))
        );
      },
      "message-deleted": (data) => {
        safeSetState(setMessages, (prev) =>
          prev.filter((msg) => msg.id !== data.messageId)
        );
      },
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentChat, userId, subscribeToChat]);

  // Initial chat fetch - only once when user logs in
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchChats();
    }

    return () => {
      isMounted.current = false;
      apiCallsInProgress.current = {};
    };
  }, [isLoggedIn, userId, fetchChats]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        messages,
        loading,
        error,
        unreadCounts,
        fetchChats,
        fetchMessages,
        createDirectChat,
        sendMessage,
        deleteMessage,
        editMessage,
        selectChat,
        userId,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
