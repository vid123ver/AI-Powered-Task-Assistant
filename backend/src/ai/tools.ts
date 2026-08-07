// import { Type } from "@google/genai";
import { Type, FunctionDeclaration } from "@google/genai";
// This file only describes the tools available to Gemini.
// It does NOT execute any tool.

export const taskTools: FunctionDeclaration[] = [
  {
    name: "list_tasks",
    description:
      "Use this tool when the user wants to view, display, show, or list all tasks.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },

  {
    name: "create_task",
    description:
      "Use this tool when the user wants to create, add, insert, save, or make a new task.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Title of the task to create.",
        },
      },
      required: ["title"],
    },
  },

];