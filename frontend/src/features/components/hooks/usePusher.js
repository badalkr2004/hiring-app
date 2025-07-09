// src/hooks/usePusher.js
import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || "your-pusher-key";
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "eu";

export const usePusher = (userId) => {
  const [pusher, setPusher] = useState(null);
  const channelRefs = useRef(new Map());

  useEffect(() => {
    if (!userId || !PUSHER_KEY) return;

    try {
      const pusherInstance = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        encrypted: true,
      });

      setPusher(pusherInstance);

      return () => {
        // Clean up all channels and disconnect
        channelRefs.current.forEach((channel) => {
          pusherInstance.unsubscribe(channel);
        });
        channelRefs.current.clear();
        pusherInstance.disconnect();
      };
    } catch (error) {
      console.error("Error initializing Pusher:", error);
    }
  }, [userId]);

  const subscribeToChat = (chatId, events = {}) => {
    if (!pusher || !chatId) return null;

    try {
      // Check if we're already subscribed
      const channelName = `chat-${chatId}`;
      if (channelRefs.current.has(channelName)) {
        // Unbind previous events
        const existingChannel = channelRefs.current.get(channelName);
        Object.keys(events).forEach((event) => {
          existingChannel.unbind(event);
        });

        // Bind new events
        Object.entries(events).forEach(([event, handler]) => {
          existingChannel.bind(event, handler);
        });

        return () => {
          Object.keys(events).forEach((event) => {
            existingChannel.unbind(event);
          });
        };
      }

      // Subscribe to new channel
      const channel = pusher.subscribe(channelName);
      channelRefs.current.set(channelName, channel);

      // Setup event handlers
      Object.entries(events).forEach(([event, handler]) => {
        channel.bind(event, handler);
      });

      return () => {
        Object.keys(events).forEach((event) => {
          channel.unbind(event);
        });
        pusher.unsubscribe(channelName);
        channelRefs.current.delete(channelName);
      };
    } catch (error) {
      console.error(`Error subscribing to chat ${chatId}:`, error);
      return null;
    }
  };

  const subscribeToUser = (events = {}) => {
    if (!pusher || !userId) return null;

    try {
      const channelName = `user-${userId}`;
      if (channelRefs.current.has(channelName)) {
        // Unbind previous events
        const existingChannel = channelRefs.current.get(channelName);
        Object.keys(events).forEach((event) => {
          existingChannel.unbind(event);
        });

        // Bind new events
        Object.entries(events).forEach(([event, handler]) => {
          existingChannel.bind(event, handler);
        });

        return () => {
          Object.keys(events).forEach((event) => {
            existingChannel.unbind(event);
          });
        };
      }

      const channel = pusher.subscribe(channelName);
      channelRefs.current.set(channelName, channel);

      Object.entries(events).forEach(([event, handler]) => {
        channel.bind(event, handler);
      });

      return () => {
        Object.keys(events).forEach((event) => {
          channel.unbind(event);
        });
        pusher.unsubscribe(channelName);
        channelRefs.current.delete(channelName);
      };
    } catch (error) {
      console.error("Error subscribing to user channel:", error);
      return null;
    }
  };

  return { pusher, subscribeToChat, subscribeToUser };
};
