import { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import * as taskApi from "../api/taskApi";

const GENERIC_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await taskApi.getTasks();

      setTasks(data);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (
    title: string,
    dueDate?: string
  ) => {
    try {
      const newTask = await taskApi.addTask(
        title,
        dueDate
      );

      setTasks((previousTasks) => [
        ...previousTasks,
        newTask,
      ]);
    } catch (error) {
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    setError(null);

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );

    try {
      const updatedTask = await taskApi.toggleTask(id);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      );
    } catch {
      setTasks(previousTasks);
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    try {
      await taskApi.deleteTask(id);
    } catch {
      setTasks(previousTasks);
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  const editTask = async (
    task: Task,
    updates: {
      title: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    }
  ) => {
    setError(null);

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              title: updates.title,
              priority: updates.priority,
              dueDate: updates.dueDate,
            }
          : currentTask
      )
    );

    try {
      const updatedTask = await taskApi.updateTask(
        task.id,
        {
          title: updates.title,
          priority: updates.priority,
          dueDate: updates.dueDate,
        }
      );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id
            ? updatedTask
            : currentTask
        )
      );
    } catch {
      setTasks(previousTasks);
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  };
};