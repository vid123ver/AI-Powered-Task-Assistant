import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerListTasks(server: McpServer) {
  server.registerTool(
    "list_tasks",
    {
      description:
        "Use this tool when the user wants to view, list, or see their existing tasks. It retrieves all tasks from the task management system. Do not use this tool to create, update, or delete tasks.",
      inputSchema: z.object({})
    },
    async () => {
      const tasks = await taskApi.listTasks();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tasks, null, 2)
          }
        ]
      };
    }
  );
}