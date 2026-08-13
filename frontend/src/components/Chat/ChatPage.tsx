import { useState } from "react";

function ChatPage() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    console.log("Message:", message);

    setMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">AI Task Assistant</h1>
        <p className="text-sm text-gray-500">
          Manage your tasks using natural language
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="max-w-[80%] rounded-lg bg-gray-100 p-3">
          <p className="text-sm">
            Hello! I can help you create, update, list, and delete tasks.
          </p>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
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