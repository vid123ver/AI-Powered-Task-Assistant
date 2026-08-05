import crypto from "crypto";
import { Task } from "../models/Task";
import * as taskRepository from "../repositories/taskRepository";

export const findAll = async (): Promise<Task[]> => {
  return taskRepository.readTasks();
};

export const findById = async (id: string): Promise<Task | undefined> => {
  const tasks = await taskRepository.readTasks();
  return tasks.find((task) => task.id === id);
};

export const create = async (title: string): Promise<Task> => {
  const tasks = await taskRepository.readTasks();

  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    completed: false,
  };

  tasks.push(newTask);
  await taskRepository.writeTasks(tasks);

  return newTask;
};

export const update = async (
  id: string,
  updates: { title?: string; completed?: boolean }
): Promise<Task | undefined> => {
  const tasks = await taskRepository.readTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return undefined;
  }

  if (updates.title !== undefined) {
    task.title = updates.title;
  }

  if (updates.completed !== undefined) {
    task.completed = updates.completed;
  }

  await taskRepository.writeTasks(tasks);
  return task;
};

export const remove = async (id: string): Promise<boolean> => {
  const tasks = await taskRepository.readTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  await taskRepository.writeTasks(tasks);

  return true;
};

export const toggle = async (id: string): Promise<Task | undefined> => {
  const tasks = await taskRepository.readTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return undefined;
  }

  task.completed = !task.completed;
  await taskRepository.writeTasks(tasks);

  return task;
};