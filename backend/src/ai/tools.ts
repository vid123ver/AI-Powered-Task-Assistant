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
  {
  name: "update_task",
  description:
    "Use this tool when the user wants to update, edit, modify, rename, change the title, mark complete, mark incomplete, or change the status of an existing task.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: "The ID of the task to update.",
      },
      title: {
        type: Type.STRING,
        description: "The new title of the task.",
      },
      completed: {
        type: Type.BOOLEAN,
        description: "Whether the task is completed.",
      },
    },
    required: ["id"],
  },
},

];