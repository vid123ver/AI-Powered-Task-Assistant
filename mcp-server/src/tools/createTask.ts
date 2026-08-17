import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerCreateTask(server: McpServer) {
  server.registerTool(
    "create_task",
    {
      description:
        "Use this tool when the user wants to create or add a new task. The task must have a title. Use the completed field only when the user explicitly specifies whether the new task is completed. Use priority when the user specifies a priority. Use dueDate when the user gives a due date such as today, tomorrow, Friday, or a specific date.",
      inputSchema: z.object({
        title: z.string().min(1),
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.string().min(1).optional()
      })
    },
    async ({ title, completed, priority, dueDate }) => {
      const task = await taskApi.createTask({
        title,
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate })
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
                priority: task.priority,
                dueDate: task.dueDate
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