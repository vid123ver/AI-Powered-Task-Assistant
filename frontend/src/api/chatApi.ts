import axios from "axios";
import api from "./api";

interface ChatRequest {
  sessionId: string;
  message: string;
}

interface ChatResponse {
  success: boolean;
  reply: string;
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