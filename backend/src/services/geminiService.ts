import { Chat } from "@google/genai";
import geminiClient from "../config/gemini";
import { taskTools } from "../ai/tools";
import * as taskService from "./taskService";
import { systemInstruction } from "../ai/systemInstruction";
import { AppError } from "../utils/AppError";
import { normalizeDueDate } from "../utils/dateUtils";

type ChatActionType =
  | "create_task"
  | "update_task"
  | "delete_task"
  | "list_tasks";

interface ChatAction {
  type: ChatActionType;
  task?: unknown;
  count?: number;
}

interface ChatResult {
  reply: string;
  actions: ChatAction[];
}

class GeminiService {
  private sessions = new Map<string, Chat>();

  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<ChatResult> {
    try {
      let chat = this.sessions.get(sessionId);

      if (!chat) {
        chat = geminiClient.chats.create({
          model:
            process.env.GEMINI_MODEL || "gemini-2.5-flash",
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

      const actions: ChatAction[] = [];

      let loopCount = 0;
      const maxLoops = 10;

      while (response.functionCalls?.length) {
        if (loopCount >= maxLoops) {
          throw new Error(
            "Maximum tool calling limit reached."
          );
        }

        loopCount++;

        const functionResponses = [];

        for (const call of response.functionCalls) {
          try {
            if (call.name === "list_tasks") {
              const tasks = await taskService.findAll();

              actions.push({
                type: "list_tasks",
                count: tasks.length,
              });

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
                dueDate?: string;
              };

              let normalizedDueDate: string | undefined;

              if (args.dueDate !== undefined) {
                const parsedDueDate = normalizeDueDate(
                  args.dueDate
                );

                if (!parsedDueDate) {
                  throw new AppError(
                    `Invalid due date: ${args.dueDate}`,
                    400
                  );
                }

                normalizedDueDate = parsedDueDate;
              }

              const newTask = await taskService.create(
                args.title,
                args.priority ?? "medium",
                normalizedDueDate
              );

              actions.push({
                type: "create_task",
                task: newTask,
              });

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
                dueDate?: string;
              };

              const updates: {
                title?: string;
                completed?: boolean;
                priority?: "low" | "medium" | "high";
                dueDate?: string;
              } = {
                title: args.title,
                completed: args.completed,
                priority: args.priority,
              };

              if (args.dueDate !== undefined) {
                const parsedDueDate = normalizeDueDate(
                  args.dueDate
                );

                if (!parsedDueDate) {
                  throw new AppError(
                    `Invalid due date: ${args.dueDate}`,
                    400
                  );
                }

                updates.dueDate = parsedDueDate;
              }

              const updatedTask = await taskService.update(
                args.id,
                updates
              );

              actions.push({
                type: "update_task",
                task: updatedTask,
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

              actions.push({
                type: "delete_task",
              });

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

      return {
        reply: response.text ?? "No response from Gemini.",
        actions,
      };
    } catch (error) {
  console.error("Gemini API Error:", error);

  const status = (error as { status?: number }).status;

  if (status === 429) {
    throw new AppError(
      "Gemini API quota exceeded. Please wait a while or try again later.",
      429
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