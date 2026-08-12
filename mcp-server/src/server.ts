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
  async ({ title, completed , priority }) => {
    const response = await fetch("http://localhost:5001/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        completed: completed ?? false,
        priority: priority?? "medium"
      })
    });

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    const task = await response.json();

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
server.registerTool(
  "update_task",
  {
    description:
      "Use this tool when the user wants to modify an existing task. The task ID is required. Use the title field when the user wants to rename the task and the completed field when the user wants to change its completion status. Do not use this tool to create a new task.",
    inputSchema: z.object({
      id: z.string().min(1),
      title: z.string().min(1).optional(),
      completed: z.boolean().optional(),
      priority: z.enum(["low", "medium", "high"]).optional()
    })
  },
  async ({ id, title, completed, priority }) => {
    const response = await fetch(
      `http://localhost:5001/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...(title !== undefined && { title }),
          ...(completed !== undefined && { completed }),
          ...(priority !== undefined && { priority })
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    const task = await response.json();

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
    const response = await fetch(
      `http://localhost:5001/tasks/${id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: true,
              id
            },
            null,
            2
          )
        }
      ]
    };
  }
);
server.registerTool(
  "get_task_summary",
  {
    description:
      "Use this tool when the user wants an overview or summary of their tasks. It retrieves the current tasks and returns the total number of tasks along with counts grouped by status and priority. Do not use this tool when the user wants the full details of individual tasks.",
    inputSchema: z.object({})
  },
  async () => {
    const response = await fetch("http://localhost:5001/tasks");

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    const tasks = await response.json();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    for (const task of tasks) {
      const status = task.completed ? "completed" : "pending";

      byStatus[status] = (byStatus[status] || 0) + 1;

      const priority = task.priority ?? "medium";

      byPriority[priority] = (byPriority[priority] || 0) + 1;
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
    const response = await fetch("http://localhost:5001/tasks");

    if (!response.ok) {
      throw new Error(`Task API returned status ${response.status}`);
    }

    const tasks = await response.json();

    const searchQuery = query.toLowerCase();

    const matchingTasks = tasks.filter((task: {
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
async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});