import { useState } from "react";
import ChatWindow from "./chatWindow";
import ChatList from "./ChatList";

export default function App() {
  const [chatId, setChatId] = useState();

  return (
    <div className="h-screen flex">
      <ChatList onSelect={setChatId} />
      {chatId ? (
        <ChatWindow chatId={chatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a conversation
        </div>
      )}
    </div>
  );
}
