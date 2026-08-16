import axios from "axios";
import api from "./api";

interface ChatRequest {
  sessionId: string;
  message: string;
}

export type ChatActionType =
  | "create_task"
  | "update_task"
  | "delete_task"
  | "list_tasks";

export interface ChatAction {
  type: ChatActionType;
  task?: {
    id: string;
    title: string;
  };
  count?: number;
}

interface ChatResponse {
  success: boolean;
  reply: string;
  actions: ChatAction[];
}

export class ChatApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
  }
}

export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>("/chat", request);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 429) {
        throw new ChatApiError(
          "You've reached the AI request limit. Please try again later.",
          status
        );
      }

      if (status === 503) {
        throw new ChatApiError(
          "The AI service is temporarily unavailable. Please try again shortly.",
          status
        );
      }

      const serverMessage = error.response?.data?.message;

      throw new ChatApiError(
        serverMessage || "Unable to communicate with the AI assistant.",
        status
      );
    }

    throw new ChatApiError(
      "An unexpected error occurred while communicating with the AI assistant."
    );
  }
};