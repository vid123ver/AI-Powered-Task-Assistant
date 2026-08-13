import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerListTasks } from "./tools/listTasks.js";
import { registerCreateTask } from "./tools/createTask.js";
import { registerUpdateTask } from "./tools/updateTask.js";
import { registerDeleteTask } from "./tools/deleteTask.js";
import { registerGetTaskSummary } from "./tools/getTaskSummary.js";
import { registerSearchTasks } from "./tools/searchTasks.js";

const server = new McpServer({
  name: "task-management-server",
  version: "1.0.0"
});

registerListTasks(server);
registerCreateTask(server);
registerUpdateTask(server);
registerDeleteTask(server);
registerGetTaskSummary(server);
registerSearchTasks(server);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});