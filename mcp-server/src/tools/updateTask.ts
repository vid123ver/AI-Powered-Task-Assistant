import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerUpdateTask(server: McpServer) {
  server.registerTool(
    "update_task",
    {
      description:
        "Use this tool when the user wants to modify an existing task. The task ID is required. Use the title field when the user wants to rename the task, the completed field when the user wants to change its completion status, and the priority field when the user wants to change its priority. Do not use this tool to create a new task.",
      inputSchema: z.object({
        id: z.string().min(1),
        title: z.string().min(1).optional(),
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional()
      })
    },
    async ({ id, title, completed, priority }) => {
      const task = await taskApi.updateTask(id, {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority })
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                id: task.id,
                title: task.title,
                completed: task.completed,
                priority: task.priority
              },
              null,
              2
            )
          }
        ]
      };
    }
  );
}