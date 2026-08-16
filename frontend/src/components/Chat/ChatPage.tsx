import { useState } from "react";
import type { ChatMessage } from "../../types/Chat";
import { sendChatMessage } from "../../api/chatApi";

function ChatPage() {
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

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

  if (!trimmedMessage || isLoading) {
    return;
  }

  setIsLoading(true);

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

  try {
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
  } catch (error) {
    console.error("Chat request failed:", error);

    const errorMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Sorry, I couldn't process your request. Please try again.",
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      errorMessage,
    ]);
  } finally {
    setIsLoading(false);
  }
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

        {isLoading && (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg bg-gray-100 p-3">
        <p className="text-sm text-gray-500">
          AI is thinking...
        </p>
      </div>
    </div>
  )}


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
            disabled={isLoading}
            placeholder="Ask me to manage your tasks..."
            className="flex-1 rounded-lg border px-4 py-2 outline-none"
          />

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;