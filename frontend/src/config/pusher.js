// Pusher client configuration
import Pusher from "pusher-js";

// Initialize Pusher with your app key and cluster
// These values should match the ones in the backend configuration
export const pusherClient = new Pusher(
  import.meta.env.VITE_PUSHER_KEY || "ba9da21e58e0d0817d44",
  {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || "ap2",
    forceTLS: true,
  }
);

// Helper function to subscribe to a channel
export const subscribeToPusherChannel = (channelName, eventName, callback) => {
  const channel = pusherClient.subscribe(channelName);
  channel.bind(eventName, callback);
  return channel;
};

// Helper function to unsubscribe from a channel
export const unsubscribeFromPusherChannel = (channelName) => {
  pusherClient.unsubscribe(channelName);
};
