import Pusher from "pusher-js";

let pusherInstance = null;

export const initializePusher = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: "http://localhost:5000/api/messages/pusher/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    });
  }
  return pusherInstance;
};

export const getPusher = () => {
  return pusherInstance || initializePusher();
};
