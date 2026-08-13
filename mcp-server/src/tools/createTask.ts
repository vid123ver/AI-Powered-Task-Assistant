import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerCreateTask(server: McpServer) {
  server.registerTool(
    "create_task",
    {
      description:
        "Use this tool when the user wants to create or add a new task. The task must have a title. Use the completed field only when the user explicitly specifies whether the new task is completed.",
      inputSchema: z.object({
        title: z.string().min(1),
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional()
      })
    },
    async ({ title, completed, priority }) => {
      const task = await taskApi.createTask({
  title,
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