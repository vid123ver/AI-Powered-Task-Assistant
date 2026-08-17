import { useEffect, useState } from "react";
import type { ChatMessage } from "../../types/Chat";
import {
  ChatApiError,
  sendChatMessage,
} from "../../api/chatApi";
import ActionCard from "./ActionCard";

interface ChatPageProps {
  onTasksChanged: () => Promise<void>;
}

function ChatPage({ onTasksChanged }: ChatPageProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sessionId] = useState(() => {
    const storedSessionId =
      sessionStorage.getItem("chatSessionId");

    if (storedSessionId) {
      return storedSessionId;
    }

    const newSessionId = crypto.randomUUID();

    sessionStorage.setItem("chatSessionId", newSessionId);

    return newSessionId;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const storedMessages =
      sessionStorage.getItem("chatMessages");

    if (storedMessages) {
      try {
        return JSON.parse(storedMessages);
      } catch {
        sessionStorage.removeItem("chatMessages");
      }
    }

    return [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I can help you create, update, list, and delete tasks.",
      },
    ];
  });

  useEffect(() => {
    sessionStorage.setItem(
      "chatMessages",
      JSON.stringify(messages)
    );
  }, [messages]);

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

      try {
        await onTasksChanged();
      } catch (error) {
        console.error(
          "Failed to refresh tasks after chat action:",
          error
        );
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.reply,
        actions: response.actions,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      let errorMessage =
        "Sorry, I couldn't process your request. Please try again.";

      if (error instanceof ChatApiError) {
        errorMessage = error.message;
      }

      const assistantErrorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantErrorMessage,
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
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg sm:h-[calc(100vh-140px)]">

      {/* Header */}

      <header className="relative shrink-0 overflow-hidden border-b border-gray-700 bg-gray-900 px-4 py-4 text-white sm:px-6 sm:py-5">

        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg ring-1 ring-white/10 sm:h-12 sm:w-12 sm:text-xl">
              ✦
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h2 className="!mb-0 !text-left !text-base !font-semibold !text-white sm:!text-lg">
                  AI Task Assistant
                </h2>

                <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-gray-300 sm:inline">
                  AI
                </span>

              </div>

              <p className="!mb-0 mt-1 truncate text-xs text-gray-400 sm:text-sm">
                Your intelligent task management companion
              </p>

            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 sm:px-3">

            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="hidden text-xs font-medium text-gray-300 sm:inline">
              Online
            </span>

          </div>

        </div>

      </header>

      {/* Messages */}

      <main
  className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-3 sm:space-y-6 sm:p-6"
  aria-live="polite"
  aria-busy={isLoading}
>

        {messages.map((chatMessage) => (
          <div
            key={chatMessage.id}
            className={`flex ${
              chatMessage.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div className="max-w-[90%] sm:max-w-[75%]">

              {/* Sender */}

              <div
                className={`mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400 ${
                  chatMessage.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {chatMessage.role === "assistant" && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-900 text-[10px] text-white">
                    ✦
                  </span>
                )}

                <span>
                  {chatMessage.role === "user"
                    ? "You"
                    : "AI Assistant"}
                </span>

              </div>

              {/* Message */}

              <div
                className={`rounded-2xl px-3.5 py-2.5 shadow-sm sm:px-4 sm:py-3 ${
                  chatMessage.role === "user"
                    ? "rounded-br-md bg-gray-900 text-white"
                    : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                }`}
              >

                <p className="!mb-0 whitespace-pre-wrap break-words text-sm leading-6">
                  {chatMessage.content}
                </p>

              </div>

              {/* Actions */}

              {chatMessage.actions?.map((action, index) => (
                <ActionCard
                  key={`${chatMessage.id}-action-${index}`}
                  action={action}
                />
              ))}

            </div>

          </div>
        ))}

        {/* Loading */}

        {isLoading && (
          <div className="flex justify-start">

            <div className="max-w-[90%] sm:max-w-[75%]">

              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-gray-400">

                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-900 text-[10px] text-white">
                  ✦
                </span>

                <span>
                  AI Assistant
                </span>

              </div>

              <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">

                <div
                    className="flex items-center gap-3"
                    role="status"
                    aria-label="AI is thinking"
                >

                  <span className="text-sm text-gray-500">
                    Thinking
                  </span>

                  <div className="flex gap-1">

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Input */}

      <footer className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 sm:px-5 sm:py-4">

        <div className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 p-1.5 transition focus-within:border-gray-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200 sm:gap-2">

          <input
            type="text"
            aria-label="Message AI Task Assistant"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask me to manage your tasks..."
            className="!mb-0 min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
          />

          <button
            type="button"
            aria-label={isLoading ? "Sending message" : "Send message"}
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="!m-0 shrink-0 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            <span className="hidden sm:inline">
              {isLoading ? "Sending..." : "Send"}
            </span>

            <span className="sm:hidden">
              ↑
            </span>
          </button>

        </div>

        <p className="!mb-0 mt-2 text-center text-[11px] text-gray-400">
          Press Enter to send
        </p>

      </footer>

    </div>
  );
}

export default ChatPage;