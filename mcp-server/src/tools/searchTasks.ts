import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerSearchTasks(server: McpServer) {
  server.registerTool(
    "search_tasks",
    {
      description:
        "Use this tool when the user wants to find specific tasks based on words or phrases in their task titles. The search is case-insensitive. Do not use this tool when the user wants all tasks or only a statistical summary.",
      inputSchema: z.object({
        query: z.string().min(1)
      })
    },
    async ({ query }) => {
      const tasks = await taskApi.listTasks();

      const searchQuery = query.toLowerCase();

      const matchingTasks = tasks.filter(
        (task: {
          id: string;
          title: string;
          completed: boolean;
          priority?: "low" | "medium" | "high";
        }) =>
          task.title.toLowerCase().includes(searchQuery)
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query,
                count: matchingTasks.length,
                tasks: matchingTasks
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