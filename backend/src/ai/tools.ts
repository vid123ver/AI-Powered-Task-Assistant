import { FunctionDeclaration, Type } from "@google/genai";

export const taskTools: FunctionDeclaration[] = [
  {
    name: "list_tasks",
    description:
      "Use this tool whenever the user asks to view, list, display, show, retrieve, or check their tasks. Also use it when the user asks about pending tasks, completed tasks, existing tasks, or wants to know what tasks they currently have. Always call this tool instead of answering from memory.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },

  {
    name: "create_task",
    description:
      "Use this tool whenever the user wants to create, add, save, insert, or make a new task. If the user asks to remember something as a task or create a reminder-like task, use this tool. The title should contain only the task description.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description:
            "The title or description of the new task provided by the user.",
        },
        priority: {
          type: Type.STRING,
          enum: ["low", "medium", "high"],
          description:
            "The priority of the task. Only set this if the user explicitly states a priority (e.g. 'high priority', 'low priority', 'urgent' = high). If the user does not mention a priority, omit this field entirely and let it default.",
        },
      },
      required: ["title"],
    },
  },
 

  {
    name: "update_task",
    description:
      "Use this tool whenever the user wants to update, edit, rename, modify, change the title, mark a task as completed, mark it as incomplete, or change any existing task. Always use the task ID and update only the fields requested by the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "The unique ID of the task to update.",
        },
        title: {
          type: Type.STRING,
          description: "The new title of the task.",
        },
        completed: {
          type: Type.BOOLEAN,
          description:
            "The completion status of the task. True means completed and false means pending.",
        },
        priority: {
          type: Type.STRING,
          enum: ["low", "medium", "high"],
          description:
            "The new priority of the task. Only set this if the user explicitly asks to change the task's priority.",
        },
      },
      required: ["id"],
    },
  },
 

  {
    name: "delete_task",
    description:
      "Use this tool whenever the user wants to delete, remove, erase, discard, or permanently delete an existing task. Always call this tool before confirming that a task has been deleted.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: "The unique ID of the task to delete.",
        },
      },
      required: ["id"],
    },
  },
];