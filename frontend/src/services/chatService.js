import { api } from "../libs/apis";
import { API_BASE_URL } from "../config/api";

export const chatService = {
  // Create a direct chat with another user
  async createDirectChat(participantId) {
    try {
      const response = await api.post("/chats/direct", { participantId });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to create chat");
    }
  },

  // Get all chats for the current user
  async getUserChats(page = 1, limit = 20) {
    try {
      const response = await api.get("/chats", {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch chats");
    }
  },

  // Get messages for a specific chat
  async getChatMessages(chatId, page = 1, limit = 50) {
    try {
      const response = await api.get(`/chats/${chatId}`, {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch messages");
    }
  },

  // Send a message in a chat
  async sendMessage(chatId, content, file = null, type = "TEXT") {
    try {
      // If there's a file, use FormData
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("content", content);
        formData.append("type", type);
        
        // Custom fetch for FormData
        const url = `${API_BASE_URL}/chats/${chatId}/messages`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to send message");
        }
        return data;
      } else {
        // Regular JSON request
        const response = await api.post(`/chats/${chatId}/messages`, {
          content,
          type,
        });
        return response;
      }
    } catch (error) {
      throw new Error(error.message || "Failed to send message");
    }
  },

  // Mark all messages in a chat as read
  async markMessagesAsRead(chatId) {
    try {
      const response = await api.patch(`/chats/${chatId}/read`, {});
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to mark messages as read");
    }
  },

  // Edit a message
  async editMessage(messageId, content) {
    try {
      const response = await api.put(`/chats/messages/${messageId}`, { content });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to edit message");
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/chats/messages/${messageId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to delete message");
    }
  },

  // Get participants of a chat
  async getChatParticipants(chatId) {
    try {
      const response = await api.get(`/chats/${chatId}/participants`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch participants");
    }
  },

  // Add participants to a group chat
  async addParticipants(chatId, userIds) {
    try {
      const response = await api.post(`/chats/${chatId}/participants`, { userIds });
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to add participants");
    }
  },

  // Remove a participant from a group chat
  async removeParticipant(chatId, userId) {
    try {
      const response = await api.delete(`/chats/${chatId}/participants/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to remove participant");
    }
  },

  // Update chat settings (name, avatar)
  async updateChatSettings(chatId, settings) {
    try {
      const response = await api.patch(`/chats/${chatId}/settings`, settings);
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to update chat settings");
    }
  },
};