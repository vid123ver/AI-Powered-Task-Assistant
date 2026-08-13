import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskApi } from "../services/taskApi.js";

export function registerGetTaskSummary(server: McpServer) {
  server.registerTool(
    "get_task_summary",
    {
      description:
        "Use this tool when the user wants an overview or summary of their tasks. It returns the total number of tasks and counts grouped by status and priority. Do not use this tool when the user wants the full details of individual tasks.",
      inputSchema: z.object({})
    },
    async () => {
      const tasks = await taskApi.listTasks();

      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      for (const task of tasks) {
        const status = task.completed ? "completed" : "pending";

        byStatus[status] = (byStatus[status] || 0) + 1;

        const priority = task.priority ?? "medium";

        byPriority[priority] =
          (byPriority[priority] || 0) + 1;
      }

      const summary = {
        totalTasks: tasks.length,
        byStatus,
        byPriority
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summary, null, 2)
          }
        ]
      };
    }
  );
}