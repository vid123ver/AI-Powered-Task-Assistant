import api from "./api";
import type { Task } from "../types/Task";

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get("/tasks");
  return response.data;
};

export const addTask = async (title: string): Promise<Task> => {
  const response = await api.post("/tasks", { title });
  return response.data;
};

export const updateTask = async (
  id: string,
  title: string,
  completed: boolean
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, { title, completed });
  return response.data;
};

export const toggleTask = async (id: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}`);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};