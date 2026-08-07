import geminiClient from "../config/gemini";
import { taskTools } from "../ai/tools";
import * as taskService from "./taskService";

class GeminiService {
  async sendMessage(message: string): Promise<string> {
    try {
      const chat = geminiClient.chats.create({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
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

          else if (call.name === "create_task") {
            const args = call.args as {
              title: string;
            };

            const newTask = await taskService.create(args.title);

            response = await chat.sendMessage({
              message: [
                {
                  functionResponse: {
                    name: call.name,
                    response: {
                      task: newTask,
                    },
                  },
                },
              ],
            });
          }

          else if (call.name === "update_task") {
            const args = call.args as {
              id: string;
              title?: string;
              completed?: boolean;
            };

            const updatedTask = await taskService.update(args.id, {
              title: args.title,
              completed: args.completed,
            });

            response = await chat.sendMessage({
              message: [
                {
                  functionResponse: {
                    name: call.name,
                    response: {
                      task: updatedTask,
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
      if ((error as any).status === 429) {
  throw new Error(
    "Gemini API quota exceeded. Please wait a while or use another API key."
  );
}

throw error;
    }
  }
}

export default new GeminiService();