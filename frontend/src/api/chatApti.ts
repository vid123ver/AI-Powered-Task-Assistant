import api from "./api";

interface ChatRequest {
  sessionId: string;
  message: string;
}

interface ChatResponse {
  success: boolean;
  reply: string;
}

export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>("/chat", request);

  return response.data;
};