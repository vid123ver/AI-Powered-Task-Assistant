import crypto from "crypto";
import { Task } from "../models/Task";
import { AppError } from "../utils/AppError";
import * as taskRepository from "../repositories/taskRepository";

export const findAll = async (): Promise<Task[]> => {
  return taskRepository.readTasks();
};

export const findById = async (id: string): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

export const create = async (title: string, priority: "low" | "medium" | "high"): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority: priority ?? "medium"
  };

  tasks.push(newTask);
  await taskRepository.writeTasks(tasks);

  return newTask;
};

export const update = async (
  id: string,
  updates: { title?: string; completed?: boolean; priority?: "low" | "medium" | "high" }
): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (updates.title !== undefined) {
    task.title = updates.title;
  }

  if (updates.completed !== undefined) {
    task.completed = updates.completed;
  }

  if (updates.priority !== undefined) {
    task.priority = updates.priority;
  }
  await taskRepository.writeTasks(tasks);

  return task;
};

export const remove = async (id: string): Promise<void> => {
  const tasks = await taskRepository.readTasks();

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    throw new AppError("Task not found", 404);
  }

  tasks.splice(index, 1);

  await taskRepository.writeTasks(tasks);
};

export const toggle = async (id: string): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  task.completed = !task.completed;

  await taskRepository.writeTasks(tasks);

  return task;
};