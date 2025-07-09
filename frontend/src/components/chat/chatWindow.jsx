import { useCallback, useEffect, useRef, useState } from "react";
import { usePusher } from "../../hooks/usePuhser";
import api from "./api";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const addMessage = useCallback(
    (m) => setMessages((prev) => [...prev, m]),
    []
  );

  usePusher(chatId, addMessage);

  useEffect(() => {
    api
      .get(`/chats/chats/${chatId}/messages`)
      .then((r) => setMessages(r.data.data));
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const { data } = await api.post(`/chats/chats/${chatId}/messages`, {
      content: text,
    });
    addMessage(data.data);
    setText("");
  };

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              m.senderId ===
              JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message…"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-lg"
          onClick={send}
        >
          Send
        </button>
      </div>
    </div>
  );
}
