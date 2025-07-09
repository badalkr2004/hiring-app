import { useEffect, useState } from "react";
import api from "@/api";

export default function ChatList({ onSelect }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    api.get("/chats/chats").then((r) => setChats(r.data.data));
  }, []);

  return (
    <div className="w-64 border-r h-full overflow-y-auto">
      {chats.map((c) => {
        const partner = c.participants[0].user;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-full flex gap-2 p-3 hover:bg-gray-100"
          >
            <img
              src={partner.avatar || "/avatar.png"}
              className="w-10 h-10 rounded-full"
            />
            <div className="text-left">
              <p className="font-medium">
                {partner.firstName} {partner.lastName}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {c.messages[0]?.content || "Say hi 👋"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
