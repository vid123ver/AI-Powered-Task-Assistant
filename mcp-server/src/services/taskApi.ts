const API_BASE_URL =
  process.env.TASK_API_BASE_URL || "http://localhost:5001";
const taskApiToken = process.env.TASK_API_TOKEN;

if (!taskApiToken) {
  throw new Error("TASK_API_TOKEN is not configured");
}

const apiRequest = async (
  url: string,
  options: RequestInit = {}
) => {
  const headers = new Headers(options.headers);

  headers.set(
    "Authorization",
    `Bearer ${taskApiToken}`
  );

  return fetch(url, {
    ...options,
    headers
  });
};

export const taskApi = {
  async listTasks() {
    const response = await apiRequest(
      `${API_BASE_URL}/tasks`
    );

    if (!response.ok) {
      throw new Error(
        `Task API returned status ${response.status}`
      );
    }

    return response.json();
  },

  async createTask(data: {
    title: string;
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }) {
    const response = await apiRequest(
      `${API_BASE_URL}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: data.title,
          completed: data.completed ?? false,
          priority: data.priority ?? "medium",
          ...(data.dueDate !== undefined && {
            dueDate: data.dueDate
          })
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Task API returned status ${response.status}`
      );
    }

    return response.json();
  },

  async updateTask(
    id: string,
    data: {
      title?: string;
      completed?: boolean;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
    }
  ) {
    const response = await apiRequest(
      `${API_BASE_URL}/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      throw new Error(
        `Task API returned status ${response.status}`
      );
    }

    return response.json();
  },

  async deleteTask(id: string) {
    const response = await apiRequest(
      `${API_BASE_URL}/tasks/${id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error(
        `Task API returned status ${response.status}`
      );
    }

    return {
      success: true,
      id
    };
  }
};