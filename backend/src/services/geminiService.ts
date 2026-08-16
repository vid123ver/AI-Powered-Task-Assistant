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

      while (response.functionCalls?.length) {
        if (loopCount >= maxLoops) {
          throw new Error("Maximum tool calling limit reached.");
        }

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
                priority?: "low" | "medium" | "high";
              };

              const newTask = await taskService.create(
                args.title,
                args.priority ?? "medium"
              );

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
                priority?: "low" | "medium" | "high";
              };

              const updatedTask = await taskService.update(
                args.id,
                {
                  title: args.title,
                  completed: args.completed,
                  priority: args.priority,
                }
              );

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

            else {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: {
                    error: `Unknown tool: ${call.name}`,
                  },
                },
              });
            }
          } catch (error) {
            const errorMessage =
              error instanceof AppError
                ? error.message
                : error instanceof Error
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

      return response.text ?? "No response from Gemini.";
    } catch (error) {
  console.error("Gemini API Error:", error);

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : undefined;

  if (status === 429) {
    throw new AppError(
      "Gemini API rate limit reached. Please try again later.",
      429
    );
  }

  if (status === 503) {
    throw new AppError(
      "The AI service is temporarily unavailable. Please try again shortly.",
      503
    );
  }

  if (error instanceof AppError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new AppError(
      "Something went wrong while communicating with the AI service.",
      500
    );
  }

  throw new AppError(
    "Unknown error occurred while communicating with the AI service.",
    500
  );
}
  }
}

export default new GeminiService();