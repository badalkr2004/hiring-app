// src/services/chatService.js
import api from "./api";

export const chatService = {
  // Get all user chats
  getUserChats: async (page = 1, limit = 20) => {
    try {
      const response = await api.get(`/chats?page=${page}&limit=${limit}`);
      return response.data; // ✅ always return array
    } catch (error) {
      console.error("Error fetching chats:", error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create direct chat
  createDirectChat: async (participantId) => {
    try {
      // Validate ID format to prevent unnecessary API calls
      if (!/^[0-9a-fA-F]{24}$/.test(participantId)) {
        throw new Error("Invalid participant ID format");
      }

      const response = await api.post("/chats/direct", { participantId });
      return response.data;
    } catch (error) {
      console.error("Error creating direct chat:", error);
      throw error;
    }
  },

  // Get chat messages - FIXED PATH
  getChatMessages: async (chatId, page = 1, limit = 50) => {
    try {
      const response = await api.get(
        `/chats/${chatId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  },

  // Send message (with optional file) - FIXED FUNCTION NAME
  sendMessage: async (chatId, content, file = null) => {
    try {
      const formData = new FormData();
      formData.append("content", content || "");

      if (file) {
        formData.append("file", file);
      }

      const response = await api.post(`/chats/${chatId}/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Mark messages as read - FIXED FUNCTION NAME
  markMessagesAsRead: async (chatId) => {
    try {
      const response = await api.patch(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return { success: false };
    }
  },

  // Edit message
  editMessage: async (messageId, content) => {
    try {
      const response = await api.put(`/chats/messages/${messageId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chats/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },

  // Get participants
  getChatParticipants: async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/participants`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat participants:", error);
      return [];
    }
  },
};
