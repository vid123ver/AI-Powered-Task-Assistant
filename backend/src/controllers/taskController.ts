import { Request, Response } from "express";
import * as taskService from "../services/taskService";
import { validateTitle, validateCompleted } from "../utils/taskValidator";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.findAll();
  res.json(tasks);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const task = await taskService.findById(id);

  res.json(task);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const titleCheck = validateTitle(req.body.title);

  if (!titleCheck.valid) {
    throw new AppError(titleCheck.message as string, 400);
  }

  const newTask = await taskService.create(titleCheck.value as string);

  res.status(201).json(newTask);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const titleCheck = validateTitle(req.body.title);

  if (!titleCheck.valid) {
    throw new AppError(titleCheck.message as string, 400);
  }

  const completedCheck = validateCompleted(req.body.completed);

  if (!completedCheck.valid) {
    throw new AppError(completedCheck.message as string, 400);
  }

  const updatedTask = await taskService.update(id, {
    title: titleCheck.value,
    completed: req.body.completed,
  });

  res.json(updatedTask);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  await taskService.remove(id);

  res.json({
    message: "Task deleted successfully",
  });
});

export const toggleTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const updatedTask = await taskService.toggle(id);

  res.json(updatedTask);
});