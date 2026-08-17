import { Request, Response } from "express";
import * as taskService from "../services/taskService";
import {
  validateTitle,
  validateCompleted,
} from "../utils/taskValidator";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { normalizeDueDate } from "../utils/dateUtils";

export const getAllTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const tasks = await taskService.findAll();

    res.json(tasks);
  }
);

export const getTaskById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const task = await taskService.findById(id);

    res.json(task);
  }
);

export const createTask = asyncHandler(
  async (req: Request, res: Response) => {
    const titleCheck = validateTitle(req.body.title);

    if (!titleCheck.valid) {
      throw new AppError(
        titleCheck.message as string,
        400
      );
    }

    const priority =
      req.body.priority ?? "medium";

    let dueDate: string | undefined;

    if (req.body.dueDate !== undefined) {
      const normalizedDueDate = normalizeDueDate(
        String(req.body.dueDate)
      );

      if (!normalizedDueDate) {
        throw new AppError(
          "Invalid due date. Use a date such as 2026-08-25, today, tomorrow, or a weekday such as Friday.",
          400
        );
      }

      dueDate = normalizedDueDate;
    }

    const newTask = await taskService.create(
      titleCheck.value as string,
      priority,
      dueDate
    );

    res.status(201).json(newTask);
  }
);

export const updateTask = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    let title: string | undefined;

    if (req.body.title !== undefined) {
      const titleCheck = validateTitle(
        req.body.title
      );

      if (!titleCheck.valid) {
        throw new AppError(
          titleCheck.message as string,
          400
        );
      }

      title = titleCheck.value;
    }

    const completedCheck = validateCompleted(
      req.body.completed
    );

    if (!completedCheck.valid) {
      throw new AppError(
        completedCheck.message as string,
        400
      );
    }

    let dueDate: string | undefined;

    if (req.body.dueDate !== undefined) {
      const normalizedDueDate = normalizeDueDate(
        String(req.body.dueDate)
      );

      if (!normalizedDueDate) {
        throw new AppError(
          "Invalid due date. Use a date such as 2026-08-25, today, tomorrow, or a weekday such as Friday.",
          400
        );
      }

      dueDate = normalizedDueDate;
    }

    if (
      req.body.title === undefined &&
      req.body.completed === undefined &&
      req.body.priority === undefined &&
      req.body.dueDate === undefined
    ) {
      throw new AppError(
        "At least one of title, completed, priority, or dueDate must be provided",
        400
      );
    }

    const updatedTask = await taskService.update(
      id,
      {
        title,
        completed: req.body.completed,
        priority: req.body.priority,
        dueDate,
      }
    );

    res.json(updatedTask);
  }
);

export const deleteTask = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    await taskService.remove(id);

    res.json({
      message: "Task deleted successfully",
    });
  }
);

export const toggleTask = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const updatedTask =
      await taskService.toggle(id);

    res.json(updatedTask);
  }
);