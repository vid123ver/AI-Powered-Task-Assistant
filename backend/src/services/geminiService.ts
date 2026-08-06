import geminiClient from "../config/gemini";
import { taskTools } from "../ai/tools";
import * as taskService from "./taskService";
class GeminiService {
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await geminiClient.models.generateContent({
  model: "gemini-flash-latest",
  contents: message,
  config: {
    tools: [
      {
        functionDeclarations: taskTools,
      },
    ],
  },
});
const functionCall =
  response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

console.log("Function Call:", functionCall);
if (functionCall?.name === "list_tasks") {
  const tasks = await taskService.findAll();

  console.log("Tasks:", tasks);
}
    console.log(JSON.stringify(response, null, 2));
      return response.text ?? "No response received from Gemini.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to communicate with Gemini.");
    }
  }
}

export default new GeminiService();