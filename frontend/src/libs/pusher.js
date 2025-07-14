import Pusher from "pusher-js";
import { API_BASE_URL } from "../config/api";

let pusherInstance = null;
API_BASE_URL;
export const initializePusher = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${API_BASE_URL}/messages/pusher/auth`,
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
