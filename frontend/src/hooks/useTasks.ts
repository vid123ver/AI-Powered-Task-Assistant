import { useEffect, useState } from "react";
import type { Task } from "../types/Task";
import * as taskApi from "../api/taskApi";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
    const data = await taskApi.getTasks();

    console.log("Tasks API response:", data);
    console.log("Is array:", Array.isArray(data));

    setTasks(data);
  } catch (error) {
    setError(GENERIC_ERROR_MESSAGE);
  } finally {
    setIsLoading(false);
  }
  };

  const addTask = async (title: string) => {
    setError(null);

    try {
      await taskApi.addTask(title);
      fetchTasks();
    } catch (error) {
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  const toggleTask = async (id: string) => {
    setError(null);

    try {
      await taskApi.toggleTask(id);
      fetchTasks();
    } catch (error) {
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);

    try {
      await taskApi.deleteTask(id);
      fetchTasks();
    } catch (error) {
      setError(GENERIC_ERROR_MESSAGE);
    }
  };

  const editTask = async (task: Task, newTitle: string) => {
    setError(null);

    try {
      await taskApi.updateTask(task.id, newTitle, task.completed);
      fetchTasks();
    } catch (error) {
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