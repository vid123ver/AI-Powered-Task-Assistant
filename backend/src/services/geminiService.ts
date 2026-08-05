import geminiClient from "../config/gemini";

class GeminiService {
  async sendMessage(message: string): Promise<string> {
  try {
    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return response.text ?? "No response received from Gemini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with Gemini.");
  }
}
}

export default new GeminiService();