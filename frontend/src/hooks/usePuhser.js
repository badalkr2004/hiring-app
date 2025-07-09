import { useEffect, useRef } from "react";
import Pusher, { Channel } from "pusher-js";

export const usePusher = (chatId, onMessage) => {
  const channelRef = useRef();

  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: "htpp://localhost:5000/api/chats/chats/pusher/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    });

    channelRef.current = pusher.subscribe(`private-chat-${chatId}`);

    channelRef.current.bind("message:new", onMessage);

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind("message:new", onMessage);
        pusher.unsubscribe(`private-chat-${chatId}`);
      }
    };
  }, [chatId, onMessage]);
};
