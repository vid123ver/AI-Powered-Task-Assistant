import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "task-management-server",
  version: "1.0.0"
});

server.registerTool(
  "list_tasks",
  {
    description:
      "Use this tool when the user wants to view, list, or see their existing tasks. It retrieves all tasks from the task management system. Do not use this tool to create, update, or delete tasks.",
    inputSchema: z.object({})
  },
  async () => {
    const response = await fetch("http://localhost:5001/tasks");

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    const tasks = await response.json();

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

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});