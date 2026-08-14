import { useState } from "react";
import type { ChatMessage } from "../../types/Chat";
import { sendChatMessage } from "../../api/chatApi";

function ChatPage() {
  const [message, setMessage] = useState("");

  const [sessionId] = useState(() => crypto.randomUUID());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I can help you create, update, list, and delete tasks.",
    },
  ]);

  const handleSend = async () => {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return;
  }

  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: trimmedMessage,
  };

  setMessages((previousMessages) => [
    ...previousMessages,
    newMessage,
  ]);

  setMessage("");

  const response = await sendChatMessage({
    sessionId,
    message: trimmedMessage,
  });

  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: response.reply,
  };

  setMessages((previousMessages) => [
    ...previousMessages,
    assistantMessage,
  ]);
};

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">
          AI Task Assistant
        </h1>

        <p className="text-sm text-gray-500">
          Manage your tasks using natural language
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((chatMessage) => (
          <div
            key={chatMessage.id}
            className={`flex ${
              chatMessage.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                chatMessage.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              <p className="text-sm">
                {chatMessage.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask me to manage your tasks..."
            className="flex-1 rounded-lg border px-4 py-2 outline-none"
          />

          <button
            onClick={handleSend}
            className="rounded-lg bg-black px-5 py-2 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;