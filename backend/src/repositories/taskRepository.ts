import fs from "fs/promises";
import path from "path";
import type { Task } from "../models/Task";

const DATA_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "tasks.json"
);

export const readTasks = async (): Promise<Task[]> => {
  const raw = await fs.readFile(DATA_FILE, "utf-8");

  return JSON.parse(raw) as Task[];
};

export const writeTasks = async (
  tasks: Task[]
): Promise<void> => {
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(tasks, null, 2),
    "utf-8"
  );
};