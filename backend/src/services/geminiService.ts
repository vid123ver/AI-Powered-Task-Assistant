// import geminiClient from "../config/gemini";
// import { taskTools } from "../ai/tools";
// import * as taskService from "./taskService";
// class GeminiService {
//   async sendMessage(message: string): Promise<string> {
//     try {
//       const response = await geminiClient.models.generateContent({
//   model: "gemini-flash-latest",
//   contents: message,
//   config: {
//     tools: [
//       {
//         functionDeclarations: taskTools,
//       },
//     ],
//   },
// });
// const functionCall =
//   response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

// console.log("Function Call:", functionCall);
// if (functionCall?.name === "list_tasks") {
//   const tasks = await taskService.findAll();

//   console.log("Tasks:", tasks);
// }
//     console.log(JSON.stringify(response, null, 2));
//       return response.text ?? "No response received from Gemini.";
//     } catch (error) {
//       console.error("Gemini API Error:", error);
//       throw new Error("Failed to communicate with Gemini.");
//     }
//   }
// }

// export default new GeminiService();
import geminiClient from "../config/gemini";
import { taskTools } from "../ai/tools";
import * as taskService from "./taskService";

class GeminiService {
  async sendMessage(message: string): Promise<string> {
    try {
      const chat = geminiClient.chats.create({
        model: "gemini-flash-latest",
        config: {
          tools: [
            {
              functionDeclarations: taskTools,
            },
          ],
        },
      });

      let response = await chat.sendMessage({
        message,
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === "list_tasks") {
            const tasks = await taskService.findAll();

            response = await chat.sendMessage({
              message: [
                {
                  functionResponse: {
                    name: call.name,
                    response: {
                      tasks,
                    },
                  },
                },
              ],
            });
          }
        }
      }

      return response.text ?? "No response from Gemini.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to communicate with Gemini.");
    }
  }
}

export default new GeminiService();