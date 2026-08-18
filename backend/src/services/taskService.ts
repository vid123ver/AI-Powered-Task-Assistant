import crypto from "crypto";
import { Task } from "../models/Task";
import { AppError } from "../utils/AppError";
import * as taskRepository from "../repositories/taskRepository";

const normalizeTitle = (title: string): string => {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
};

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

export const create = async (
  title: string,
  priority: "low" | "medium" | "high",
  dueDate?: string
): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const normalizedTitle = normalizeTitle(title);

  const duplicateTask = tasks.find(
    (task) => normalizeTitle(task.title) === normalizedTitle
  );

  if (duplicateTask) {
    throw new AppError(
      `A task with the title "${duplicateTask.title}" already exists.`,
      409
    );
  }

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    priority: priority ?? "medium",
    dueDate,
  };

  tasks.push(newTask);

  await taskRepository.writeTasks(tasks);

  return newTask;
};

export const update = async (
  id: string,
  updates: {
    title?: string;
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }
): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (updates.title !== undefined) {
    const normalizedTitle = normalizeTitle(
      updates.title
    );

    const duplicateTask = tasks.find(
      (existingTask) =>
        existingTask.id !== id &&
        normalizeTitle(existingTask.title) ===
          normalizedTitle
    );

    if (duplicateTask) {
      throw new AppError(
        `A task with the title "${duplicateTask.title}" already exists.`,
        409
      );
    }

    task.title = updates.title.trim();
  }

  if (updates.completed !== undefined) {
    task.completed = updates.completed;
  }

  if (updates.priority !== undefined) {
    task.priority = updates.priority;
  }

  if (updates.dueDate !== undefined) {
    task.dueDate = updates.dueDate;
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