import { Request, Response, NextFunction } from "express";

export const validateChatRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { message } = req.body;

  if (message === undefined || message === null) {
    res.status(400).json({
      success: false,
      message: "Message is required.",
    });
    return;
  }

  if (typeof message !== "string") {
    res.status(400).json({
      success: false,
      message: "Message must be a string.",
    });
    return;
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length === 0) {
    res.status(400).json({
      success: false,
      message: "Message cannot be empty.",
    });
    return;
  }

  req.body.message = trimmedMessage;

  next();
};