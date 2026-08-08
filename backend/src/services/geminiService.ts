import { Chat } from "@google/genai";
import geminiClient from "../config/gemini";
import { taskTools } from "../ai/tools";
import * as taskService from "./taskService";
import { systemInstruction } from "../ai/systemInstruction";
import { AppError } from "../utils/AppError";

class GeminiService {
  private sessions = new Map<string, Chat>();

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<string> {
    try {
      let chat = this.sessions.get(sessionId);

      if (!chat) {
        chat = geminiClient.chats.create({
          model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          config: {
            systemInstruction,
            tools: [
              {
                functionDeclarations: taskTools,
              },
            ],
          },
        });

        this.sessions.set(sessionId, chat);
      }

      let response = await chat.sendMessage({
        message,
      });

      let loopCount = 0;
      const maxLoops = 10;

      while (response.functionCalls?.length && loopCount < maxLoops) {
        loopCount++;

        const functionResponses = [];

        for (const call of response.functionCalls) {
          try {
            if (call.name === "list_tasks") {
              const tasks = await taskService.findAll();

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: {
                    tasks,
                  },
                },
              });
            }

            else if (call.name === "create_task") {
              const args = call.args as {
                title: string;
              };

              const newTask = await taskService.create(args.title);

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: {
                    task: newTask,
                  },
                },
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

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: {
                    task: updatedTask,
                  },
                },
              });
            }

            else if (call.name === "delete_task") {
              const args = call.args as {
                id: string;
              };

              await taskService.remove(args.id);

              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: {
                    success: true,
                  },
                },
              });
            }
          } catch (error) {
            const errorMessage =
              error instanceof AppError
                ? error.message
                : "The requested task operation could not be completed.";

            functionResponses.push({
              functionResponse: {
                name: call.name,
                id: call.id,
                response: {
                  error: errorMessage,
                },
              },
            });
          }
        }

        response = await chat.sendMessage({
          message: functionResponses,
        });
      }

      if (loopCount >= maxLoops) {
        throw new Error("Maximum tool calling limit reached.");
      }

      return response.text ?? "No response from Gemini.";
    } catch (error) {
      console.error("Gemini API Error:", error);

      if ((error as any).status === 429) {
        throw new Error(
          "Gemini API quota exceeded. Please wait a while or use another API key."
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Unknown error occurred.");
    }
  }
}

export default new GeminiService();