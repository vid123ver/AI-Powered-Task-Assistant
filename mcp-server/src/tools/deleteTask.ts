import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerDeleteTask(server: McpServer) {
  server.registerTool(
    "delete_task",
    {
      description:
        "Use this tool when the user wants to permanently remove an existing task. The task ID is required. Do not use this tool when the user only wants to mark a task as completed or modify its details.",
      inputSchema: z.object({
        id: z.string().min(1)
      })
    },
    async ({ id }) => {
      const result = await taskApi.deleteTask(id);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );
}