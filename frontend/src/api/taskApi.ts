import api from "./api";
import type { Task } from "../types/Task";

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");

  return response.data;
};

export const addTask = async (
  title: string,
  dueDate?: string
): Promise<Task> => {
  try {
    const response = await api.post("/tasks", {
      title,
      dueDate,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      const message =
        error.response?.data?.message ||
        "A task with this title already exists.";

      throw new Error(message);
    }

    throw new Error(
      "Unable to create the task. Please try again."
    );
  }
};

export const updateTask = async (
  id: string,
  updates: {
    title?: string;
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }
): Promise<Task> => {
  const response = await api.put(
    `/tasks/${id}`,
    updates
  );

  return response.data;
};

export const toggleTask = async (
  id: string
): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}`);

  return response.data;
};

export const deleteTask = async (
  id: string
): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};