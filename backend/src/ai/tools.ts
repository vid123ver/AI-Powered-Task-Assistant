import { Type } from "@google/genai";

// This file only describes the tools available to Gemini.
// It does NOT execute any tool.

export const taskTools = [
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
];